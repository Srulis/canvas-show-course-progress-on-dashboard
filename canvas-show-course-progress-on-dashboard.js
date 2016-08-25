/*
 * canvas-show-course-progress-on-dashboard.js
 * by: Spencer Lawson slawson@instructure.com
 * by: Danny Wahl danny@instructure.com
 * by: Julian Ridden julian@instructure.com
 * Adds a current progress and expected progress
 * bar to the course tile.  Current progress is
 * based on the module requirements and expectedProgress
 * progress is as a percentage of total course time.
 */

$(function(){
    console.log("canvas-show-course-progress-on-dashboard.js");

    console.log("  Checking if user is on Dashboard...");
    if(window.location.pathname == "/") {

        console.log("  User is on dashboard, continuing...");
        var domain = window.location.hostname;
        var jsonURL = "https://" + domain + ":443/api/v1/courses?include[]=course_progress&enrollment_type=student";
        var progressData = {};
        var currentProgress = null;
        var expectedProgress = null;

        var toPercent = function(value) {
            console.log("  Converting value " + value + " to percentage.");
            if(value < 1) {
                var percentage = value * 100;
            } else {
                console.log("  Value is > 1, returning rounded original value.");
            }
            console.log("  Returning converted percentage " + percentage);
            percentage = percentage.toFixed();
            percentage = percentage + "%";
            return percentage;
        }

/***********************************************************************
 * insertProgress() takes a style.  Included is "bar", defined are "pie"
 * and "text".  Each type is where the output is created.  If you want
 * to create a new output style (e.g. "graph"), add it to the switch in
 * insertProgress() and then add its functionality to a new function.
 * for consistency that function should start with "render", e.g.
 * renderGraph().  The render function should check for a progress type
 * the only values for progress types are "current" and "expected".
 **********************************************************************/

        var insertProgress = function(course, type, style, progress) {
            var course = course;
            var style = style;
            var type = type;
            var progress = progress;

            switch(style) {
                case "bar":
                    renderBar(course, type, progress);
                    break;
                case "pie":
                    renderPie(course, type, progress);
                    break;
                case "text":
                    renderText(course, type, progress);
                    break;
                default:
                    renderBar(course, type, progress);
            }
        }

        var renderBar = function(course, type, progress) {
            var course = course;
            var type = type;
            var progress = progress;
            if(type == "current") {
                var currentProgressMeter = '<div id="progressbar"><div class="progress--current"></div></div>';
                var currentProgressColor = "#0c0";
                var courseID = course;
                var progress = toPercent(progress);

                console.log("  Adding current progress meter to course " + courseID + " tile.");
                $('div[data-reactid=".0.$' + courseID + '"]').append(currentProgressMeter);

                console.log("  Hiding bottom border on course " + courseID + " tile.");
                $('div[data-reactid=".0.$' + courseID + '"]').css({
                    'border-bottom-color': '#fff',
                });

                console.log("  Styling progress meters container.");
                $('#progressbar').css({
                    'height': '0px'
                });

                console.log("  Styling current progress bar.");
                $('.progress--current').css({
                    'width': progress,
                    'height': '4px',
                    'position': 'relative',
                    'bottom': '4px',
                    'background-color': currentProgressColor,
                }).attr({
                    'title': 'Current progress: ' + progress,
                    'data-tooltip': '{"tooltipClass":"popover popover-padded", "position":"bottom"}',
                });

                console.log("  Adding current progress hover events.");
            } else {
                var expectedProgressMeter = '<div class="progress--expected"></div>';
                var expectedProgressColor = "#ccc";
                var progress = toPercent(progress);
                var courseID = course;

                console.log("  Adding expected progress meter.");
                $('.progress--current').before(expectedProgressMeter);

                console.log("  Styling expected progress meter.");
                $('.progress--expected').css({
                    'width': progress,
                    'height': '4px',
                    'position': 'relative',
                    'bottom': '0px',
                    'background-color': expectedProgressColor,
                }).attr({
                    'title': 'Expected progress: ' + progress,
                    'data-tooltip': '{"tooltipClass":"popover popover-padded", "position":"bottom"}',
                });

                console.log("  Adding expected progress hover events.");
            }
        }

        var renderPie = function(course, type, progress) {
            var course = course;
            var type = type;
            var progress = progress;
            if(type == "current") {

            } else {

            }
        }

        var renderText = function(course, type, progress) {
            var course = course;
            var type = type;
            var progress = progress;
            if(type == "current") {

            } else {

            }
        }

        var calculateExpectedProgress = function(start, end) {

            var startTime = Date.parse(start);
            var startTimeMS = startTime.getTime();

            var endTime = Date.parse(end);
            var endTimeMS = endTime.getTime();

            var now = new Date();
            var nowMS = now.getTime();

            console.log("  Calculating expected progress.");
            var progress = (nowMS - startTimeMS) / (endTimeMS - startTimeMS);
            console.log(progress);

            if(progress >= 0) {
                return progress;
            } else {
                console.log("  No expected progress to display");
                return 0;
            }
        }

        console.log("  Getting course progress information...");
        var getProgress = $.getJSON(jsonURL, function(data) {
            progressData = data;
        });

        getProgress.success(function(){
            console.log("  Course progress data received, checking Current and Expected progress...");
            if(progressData.length > 0) {
                $.each(progressData, function(idx, course){

                    console.log("  Checking if course " + course.id + " has progress...");
                    currentProgress = course.course_progress.requirement_completed_count / course.course_progress.requirement_count;

                    if(isNaN(currentProgress)) {
                        console.log("  Course Progress not enabled for current course (" + course.id + "), skipping...");
                    } else {
                        console.log("  Course " + course.id + " has progress, adding current progress...");
                        insertProgress(course.id, "current", "bar", currentProgress);

                        console.log("  Checking if course " + course.id + " has start/end dates...");
                        if(course.hasOwnProperty("start_at") && course.hasOwnProperty("end_at") && course.start_at != null && course.end_at != null) {
                            console.log("  Course " + course.id + " has start/end dates, checking expected progress...");
                            expectedProgress = calculateExpectedProgress(course.start_at, course.end_at);

                            console.log("  Inserting expected progress...");
                            insertProgress(course.id, "expected", "bar", expectedProgress);
                        } else {
                            console.log("  Course does not have start/end dates, won't add expected progress.");
                        }
                    }
                });
            } else {
                console.log("  No courses found with progress data, exiting.");
            }
        });

        getProgress.error(function(){
            console.log(" Error getting course progress data, exiting.");
        });

    } else {
        console.log("  User not on dashboard, exiting.");
    }
});
