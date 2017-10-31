
module.exports = function (grunt) {
   grunt.loadNpmTasks('grunt-eslint')
   grunt.loadNpmTasks('grunt-jsdoc-to-markdown')

   grunt.registerTask('default', ['eslint', 'jsdoc2md'])


   grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),

      eslint: {
         options: {
            configFile: '.eslintrc'
         },
         target: ['index.js']
      },

      jsdoc2md: {
         oneOutputFile: {
            src: 'models/*.js',
            dest: 'models/readme.md'
         }
      }


   })
}
