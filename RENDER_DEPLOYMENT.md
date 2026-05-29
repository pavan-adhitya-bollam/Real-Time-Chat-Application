# Render Deployment Guide

## Backend Deployment Issues & Solutions

### Required Environment Variables in Render Dashboard

Go to your Render dashboard → Web Service → Environment and add these variables:

1. **MONGODB_URI**
   - Your MongoDB Atlas connection string
   - Example: `mongodb+srv://2303a51047_db_user:RJwFHLFXODpAj0D9@cluster0.e70tf6i.mongodb.net/chatapp`

2. **JWT_SECRET**
   - A secure random string for JWT token generation
   - Example: `your_secure_random_secret_key_here`

3. **CLIENT_URL**
   - Your frontend URL
   - Example: `https://real-time-chat-application-xty0.onrender.com`

4. **PORT**
   - Render automatically sets this, but you can set it to `10000`

### Changes Made for Render Compatibility

1. **server.js** - Updated to listen on `0.0.0.0` instead of just PORT
   ```javascript
   server.listen(PORT, '0.0.0.0', () => {
     console.log(`Server running on port ${PORT}`);
   });
   ```

2. **package.json** - Added engines field
   ```json
   "engines": {
     "node": ">=18.0.0"
   }
   ```

3. **render.yaml** - Added Render configuration file

### Deployment Steps

1. Push changes to GitHub
2. Go to Render dashboard
3. Add environment variables
4. Trigger manual deploy
5. Check logs for errors

### Common Issues

**Issue: Database Connection Failed**
- Verify MONGODB_URI is correct
- Check MongoDB Atlas whitelist (allow 0.0.0.0/0 for all IPs)

**Issue: CORS Errors**
- Ensure CLIENT_URL matches your frontend URL
- Check CORS configuration in server.js

**Issue: Socket.IO Not Working**
- Render uses HTTPS, ensure Socket.IO client uses HTTPS
- Update client socket.js to use production URL

### Update Client for Production

Update `client/src/socket.js`:
```javascript
const socket = io('https://real-time-chat-application-xty0.onrender.com', {
  autoConnect: false,
});
```

Update API calls in `client/src/components/Chat.jsx` and `client/src/context/AuthContext.jsx`:
```javascript
// Replace http://localhost:5000 with
https://real-time-chat-application-xty0.onrender.com
```
