module.exports = function(grunt) {
	grunt.initConfig({
		// Running 'grunt less' will compile once.
		less: {
			development: {
				options: {
					paths: ["./css"]
				},
				files: {
					"./css/style.css": "./less/style.less"
				}
			}
		},
		// Running 'grunt watch' will watch for changes.
		watch: {
			files: "./less/**/*.less",
			tasks: ["less"],
			options: {
				livereload: true
			}
		}
	});
	
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');
};