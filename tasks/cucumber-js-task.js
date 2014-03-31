module.exports = function (grunt) {

  // The Cucumber Task
  grunt.registerMultiTask('cucumberjs', 'Runs cucumber.js', function () {
    // Make this task async
    var done = this.async();

    // Load all the options
    var options = this.options();

    var steps = options.steps;
    var reqs = options.require;
    var tags = options.tags;
    var format = options.format;
    var modulePath = options.modulePath;

    grunt.verbose.writeflags(options, 'Options');

    var callback = function(succeeded) {
      var exitFunction = function() {
        done(succeeded);
      };

      // --- exit after waiting for all pending output ---
      var waitingIO = false;
      process.stdout.on('drain', function() {
        if (waitingIO) {
          // the kernel buffer is now empty
          exitFunction();
        }
      });
      if (process.stdout.write("")) {
        // no buffer left, exit now:
        exitFunction();
      } else {
        // write() returned false, kernel buffer is not empty yet...
        waitingIO = true;
      }
    };

    var files = this.filesSrc;


    var execOptions = ['node', 'node_modules/.bin/cucumber-js'];

    var _ = grunt.util._;
    if (! _.isEmpty(files)) {
      execOptions = execOptions.concat(files);
    }

    if (! _.isEmpty(steps) || ! _.isEmpty(reqs)) {
      if (_.isUndefined(reqs)) {
          reqs = [];
      } else if (!Array.isArray(reqs)) {
          reqs = [reqs];
      }

      if (! _.isUndefined(steps)) {
          reqs.push(steps);
      }

      _.each(reqs, function (req) {
        execOptions.push('-r');
        execOptions.push(req);
      });
    }

    if (! _.isEmpty(tags)) {
      execOptions.push('-t');
      execOptions.push(tags);
    }

    if (! _.isEmpty(format)) {
      execOptions.push('-f');
      execOptions.push(format);
    }

    var cucumberPath = 'cucumber';
    if (! _.isEmpty(modulePath)) {
      cucumberPath = modulePath;
    }

    grunt.verbose.writeln('Exec Options: ' + execOptions.join(' '));
    var cucumber = require(cucumberPath);
    cucumber.Cli(execOptions).run(callback);

  });
};
