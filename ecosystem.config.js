module.exports = {
  apps: [{
    name: 'apolloclaw',
    script: '/var/www/apolloclaw.ai/start.sh',
    cwd: '/var/www/apolloclaw.ai',
    env: {
      NODE_ENV: 'production',
    },
    max_restarts: 10,
    min_uptime: 15000,
    restart_delay: 5000,
    kill_timeout: 8000,
    node_args: '--max-old-space-size=512'
  }]
};
