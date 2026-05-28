const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'lib', 'context.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace login function
const oldLoginStr = `  const login = async (email: string, password: string): Promise<boolean> => {
    // Sync latest users from Supabase before checking password
    try {
      const { data: usersData } = await supabase.from('users').select('*');
      if (usersData) {
        const parsedUsers = usersData.map(convertUser);
        setUsers(parsedUsers);
        localStorage.setItem(USERS_KEY, JSON.stringify(parsedUsers));
        
        const user = parsedUsers.find(u => u.email === email && u.isActive && (!u.password || u.password === password));
        if (user) {
          setCurrentUser(user);
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
          syncData();
          return true;
        }
      }
    } catch (err) {
      console.error('Supabase login check error, falling back to local users:', err);
    }

    const user = users.find(u => u.email === email && u.isActive && (!u.password || u.password === password));
    if (user) {
      setCurrentUser(user);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return true;
    }
    return false;
  };`;

const newLoginStr = `  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        console.error('Login error:', error);
        return false;
      }

      // Fetch the full user profile from our public users table
      const { data: userData, error: uErr } = await supabase.from('users').select('*').eq('id', data.user.id).single();
      
      if (userData && !uErr) {
        const u = convertUser(userData);
        setCurrentUser(u);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(u));
        syncData();
        return true;
      }
    } catch (err) {
      console.error('Login exception:', err);
    }
    return false;
  };`;

content = content.replace(oldLoginStr, newLoginStr);

// Replace loginWithUsername
const oldLoginWithUsernameStr = `  const loginWithUsername = async (username: string, password: string): Promise<boolean> => {
    // Sync latest users from Supabase before checking password
    try {
      const { data: usersData } = await supabase.from('users').select('*');
      if (usersData) {
        const parsedUsers = usersData.map(convertUser);
        setUsers(parsedUsers);
        localStorage.setItem(USERS_KEY, JSON.stringify(parsedUsers));
        
        const user = parsedUsers.find(u => (u.username === username || u.email === username) && u.isActive && (!u.password || u.password === password));
        if (user) {
          setCurrentUser(user);
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
          syncData();
          return true;
        }
      }
    } catch (err) {
      console.error('Supabase loginWithUsername check error, falling back to local users:', err);
    }

    const user = users.find(u => (u.username === username || u.email === username) && u.isActive && (!u.password || u.password === password));
    if (user) {
      setCurrentUser(user);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return true;
    }
    return false;
  };`;

const newLoginWithUsernameStr = `  const loginWithUsername = async (username: string, password: string): Promise<boolean> => {
    try {
      // First, get the email for this username from our public table
      const { data: usersData, error: lookupErr } = await supabase
        .from('users')
        .select('email')
        .eq('username', username)
        .single();
        
      if (lookupErr || !usersData?.email) {
        // Fallback: try logging in treating username as email
        return await login(username, password);
      }
      
      return await login(usersData.email, password);
    } catch (err) {
      console.error('Username login exception:', err);
      return false;
    }
  };`;

content = content.replace(oldLoginWithUsernameStr, newLoginWithUsernameStr);

// Replace logout
const oldLogoutStr = `  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };`;

const newLogoutStr = `  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };`;

content = content.replace(oldLogoutStr, newLogoutStr);

// Also update addUser so that it creates a Supabase Auth user via API?
// No, the client does not have the permissions to create a user in Supabase Auth directly without confirming email!
// Wait, we can call a Supabase Edge Function to create users, but we don't have one.
// Since the user is an admin adding employees, if they do it from the app, Supabase Auth will block it or send emails.
// To fix this without an edge function, we can use supabase.auth.signUp() and if they are logged in as admin, it will log them out unless we use a secondary supabase client!
// Let's not modify addUser for now, I will warn the user about adding new employees.

fs.writeFileSync(filePath, content);
console.log('Auth refactoring complete.');
