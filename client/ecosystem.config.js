module.exports = {
  apps : [
    {
      name: 'ClientApp',
      script: './node_modules/react-scripts/scripts/start.js',
      ignore_watch : ["node_modules"],
      instances : 1,
      env: {
        "NODE_ENV": "development"
      },
      exec_mode : "cluster",
      time: true
    }
  ]
};
