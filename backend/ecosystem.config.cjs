module.exports = {
  apps: [
    {
      name: 'apexlearn-backend',
      script: 'src/server.js',
      instances: 'max', // Utilizes all available vCPUs on AWS EC2
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: 'logs/pm2-error.log',
      out_file: 'logs/pm2-out.log',
      merge_logs: true,
      time: true
    }
  ]
}
