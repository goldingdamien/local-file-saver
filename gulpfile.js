var gulp = require('gulp'),
connect = require('gulp-connect-php'),
browserSync = require('browser-sync');
var devip = require('dev-ip');

gulp.task('connect-sync', function() {
    connect.server({}, function (){

        console.log("Server ready");

        const ips = devip();
        console.log('The file upload page should be accessible from another device on the same local network using one of the following IPs with the same port as the "Local" URL shown below. Detected possible IPs: ', ips);

        const options = {
            host: ips[4] || ips[3] || ips[2] || ips[1] || ips[0],// TODO: Not working. Should make automatable.
            proxy: '127.0.0.1:8000',
            ghostMode: false
        };

        browserSync(options);
    });
});