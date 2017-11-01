
module.exports = function (grunt) {
   grunt.loadNpmTasks('grunt-eslint')

   grunt.registerTask('default', ['eslint', 'jsdoc2md'])


   grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),

      eslint: {
         options: {
            configFile: '.eslintrc'
         },
         target: ['index.js']
      }

   })
}
