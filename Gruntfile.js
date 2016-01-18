module.exports = function(grunt) {

  grunt.initConfig({
    jscs: {
      main: ['lib/*', 'test/*', 'index.js']
    },
    options: {
      confif: '.jscsrc'
    }
  });

  grunt.loadNpmTasks('grunt-jscs');

  grunt.registerTask('lint', ['jscs']);
};