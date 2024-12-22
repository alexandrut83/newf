# Asset Manager

A web application for managing various types of assets with real-time market data integration.

## Features

- Asset Management (Add, Update, Delete)
- Real-time market data for crypto and currencies
- User authentication
- Dashboard with asset overview
- Filter assets by type and value

## Local Development Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- API keys for CoinGecko and ExchangeRate API

### Local Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a .env file based on .env.example and fill in your values:
```bash
cp .env.example .env
```

4. Start the server:
```bash
npm start
```

For development:
```bash
npm run dev
```

## Production Deployment

### Server Prerequisites

- Ubuntu Server
- Node.js 18.x
- MongoDB
- Nginx
- PM2
- UFW (Uncomplicated Firewall)
- SSL Certificate (Let's Encrypt)

### Server Setup Instructions

1. **Initial Server Setup**
```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl git build-essential

# Set up firewall
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

2. **Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

3. **Install MongoDB**
```bash
# Import MongoDB public key
curl -fsSL https://pgp.mongodb.com/server-6.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Create MongoDB user
mongosh admin --eval 'db.createUser({user: "alex11", pwd: "153118Alex", roles: ["root"]})'
```

4. **Install Nginx**
```bash
sudo apt install -y nginx
```

5. **Install PM2**
```bash
sudo npm install -y pm2 -g
```

6. **SSL Setup with Let's Encrypt**
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Application Deployment

1. **Clone and Setup Application**
```bash
# Clone repository
git clone <repository-url> /var/www/asset-manager
cd /var/www/asset-manager

# Install dependencies
npm install

# Install client dependencies
cd client
npm install
npm run build
cd ..
```

2. **Environment Setup**
```bash
# Create and edit .env file
nano .env

# Add the following configuration:
PORT=5000
MONGO_URI=mongodb://alex11:153118Alex@localhost:27017/asset-manager?authSource=admin
JWT_SECRET=your_secure_jwt_secret
NODE_ENV=production
```

3. **Nginx Configuration**
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/asset-manager

# Add the following configuration:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /var/www/asset-manager/client/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable the site
sudo ln -s /etc/nginx/sites-available/asset-manager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

4. **SSL Certificate**
```bash
sudo certbot --nginx -d your-domain.com
```

5. **Start Application**
```bash
pm2 start server.js --name "asset-manager"
pm2 save
pm2 startup
```

### Maintenance Commands

- **View logs**: `pm2 logs asset-manager`
- **Restart app**: `pm2 restart asset-manager`
- **Monitor app**: `pm2 monit`
- **Update application**:
```bash
cd /var/www/asset-manager
git pull
npm install
cd client
npm install
npm run build
cd ..
pm2 restart asset-manager
```

## API Endpoints

### Authentication
- POST /api/users/register - Register new user
- POST /api/users/login - Login user
- GET /api/users/profile - Get user profile

### Assets
- GET /api/assets - Get all assets
- POST /api/assets - Add new asset
- PUT /api/assets/:id - Update asset
- DELETE /api/assets/:id - Delete asset
- POST /api/assets/update-market-values - Update market values for all assets

## Environment Variables

- PORT - Server port (default: 5000)
- MONGO_URI - MongoDB connection string
- JWT_SECRET - Secret key for JWT
- NODE_ENV - Environment (development/production)
- COINGECKO_API_KEY - API key for CoinGecko
- EXCHANGERATE_API_KEY - API key for ExchangeRate API

## License

MIT
