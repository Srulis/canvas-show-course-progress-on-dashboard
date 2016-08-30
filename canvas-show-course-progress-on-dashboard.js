/*
 * canvas-show-course-progress-on-dashboard.js
 * by: Spencer Lawson slawson@instructure.com
 * by: Danny Wahl danny@instructure.com
 * by: Julian Ridden julian@instructure.com
 * by: Daniel Gilogley dgilogley@instructure.com
 * Adds a current progress and expected progress bar to the course homepage.  Current progress is based on the module requirements and expectedProgress progress is as a percentage of total course time.
 */

//Display console debug info
var scriptDebug = true;

$(document).ready(function(){
	var documentPathname = document.location.pathname;
	var currentCourseID = ENV.COURSE_ID;

	//Checking to see if on the dashboard, or the course student homepage
	if(scriptDebug) console.log('Checking to see if on the dashboard, or course homepage as a student');
	if(/*ENV.current_user_roles[1] === "student" && ----Looks like the ENV object has changed in the latest update */ documentPathname === ("/courses/" + currentCourseID)){ 
		//ensure that we are a student and on the course homepage
		if(scriptDebug) console.log('... On student course homepage.');

		//use the ENV object to ensure that we're on the course page that the student is on
		var progressData = {}; //All course data
		var currentCourseData = {}; //This current coures' data

		//-------------- Start Course Homepage Progress Bar ----------------------
		//determine the current primary, secondary, and text colours of the theme
		var primaryColour = $('div#wrapper a:first').css('color'); //Used to display the progress bar 
		//var secondaryColour = 'black'; //[WIP] used to display the bar around the ourside of the pregress bar
		var textColour = $('div#wrapper p:first').css('color');

		//create the progress bar CSS based on the users theme colours!
		//Notice colours is spelt with a 'u' =P
		$('head').prepend('<style>	div.progress-bar__bar-container {height: 20px;    margin: 12px 0;    border: solid 1px ' + primaryColour + ';    border-radius: 20px;    overflow: hidden;    position: relative;    box-sizing: border-box;}</style>');

		$('head').prepend('<style> div.progress-bar__bar {background: ' + primaryColour +';    position: absolute;    top: 0;    left: 0;    height: 100%;    width: 0; -webkit-transition: width 5s; /* Safari */ transition: width 5s; text-align: center; color: white; vertical-align: middle;line-height: 18px;}</style>');
		//End Style
		
		//Create the progress area
		var progressBarHTML = '<div id="progress_div"><h2>Progress</h2><div class="progress-bar__bar-container"><span style="text-align: center;  line-height: 18px; color:' + textColour + ';" id="progress_span"><center><em>Loading progress data...</em></center></span></div>';
		$('aside#right-side > div#course_show_secondary').after(progressBarHTML);

		//Get the progress data
		var getProgress = $.getJSON("https://" + document.location.hostname + ":443/api/v1/courses?include[]=course_progress&enrollment_type=student", function(data) {progressData = data;});

	    //upon sucess of the API call
	    getProgress.success(function(){
	    	//we have all courses data - we only need the current one then quit the each loop
		    $.each(progressData, function(idx, course){
		    	if(scriptDebug) console.log('Going through the log - item: '+ idx);
		    	if(course.id == currentCourseID){
		    		if(scriptDebug) console.log('Matched the current CourseID to the Course data array');
		    		currentCourseData = courseDataReturner(course);
		    		return false;
		    	}
		    });

		    if(isNaN(currentCourseData.percentage) || currentCourseData.percentage < 1) { //if the user doesnt have a completion data!
		    	if(scriptDebug) {console.log("Didnt get a value of the progress.\n" + currentCourseData.percent);}
		    	//insert the HTML into the progress data div
		    	$('#progress_span > em:first').text('No progress data to display');
		    }else { //Else create the HTML to display the progress
		    	progressBarHTML = '<div class="progress-bar__bar" style="width: 0px;" title = "Completed: ' + currentCourseData.percentageText + '" alt = "Completed: ' + currentCourseData.percentageText + '"></div>';
		    	//insert the HTML into the progress data div
		    	$('span#progress_span').html(progressBarHTML);
		    	$('span#progress_span > div.progress-bar__bar').css('width');
		    	$('span#progress_span > div.progress-bar__bar').css('width',(currentCourseData.percentageText.toString()));
		    }
		    
		    //display the percent value as text in the bar if more than 20
		    if(currentCourseData.percentage > 10) $('span#progress_span > div.progress-bar__bar').text(currentCourseData.percentageText);
	    });

	    getProgress.error(function(){
			if(scriptDebug){console.log("Error getting course progress data, exiting.");}
			return false;
	    });
        //-------------- End Course Homepage Progress Bar ----------------------
	}else if(documentPathname === "/" && $('#dashboard h1:first').text().trim() === "Dashboard"){
		//If on the Dashboard run the dashboard script
		if(scriptDebug) console.log('... On student dashboard.');
		//Get the progress data
		var progressData = {};
		var currentProgressData = {}
		var canvasDashboardCourses = ENV.DASHBOARD_COURSES; //This is a persistant Canvas object with all canvi data
		//Get the progress data
		var getProgress = $.getJSON("https://" + document.location.hostname + ":443/api/v1/courses?include[]=course_progress&enrollment_type=student", function(data) {progressData = data;});
		var progressBarHTML = null;
		var primaryColour = null;
		var textColour = $('div#wrapper p:first').css('color');

		//insert the styles
		$('head').prepend('<style>	div.progress-bar__bar-container {height: 20px;    margin: 12px 0;border-radius: 20px;    overflow: hidden;    position: relative;    box-sizing: border-box;}</style>');
		$('head').prepend('<style> div.progress-bar__bar {position: absolute;    top: 0;    left: 0;    height: 100%;    width: 0; -webkit-transition: width 5s; /* Safari */ transition: width 5s; text-align: center; color: white; vertical-align: middle;line-height: 18px;}</style>');
	    
	    //upon sucess of the API call
	    getProgress.success(function(){
	    	if(scriptDebug) console.log('Successfully completed the API call.');
	    	$.each(progressData, function(idx, dashboardCurrent){
		    	if(scriptDebug) console.log('Going through the log - item: '+ idx +' to see if they are a student adn have progress data...');
		    	//get the data is a better-a format
		    	currentProgressData = courseDataReturner(dashboardCurrent);
		    	//make sure the user role is student and that there is a matching item on the dashboard and there is percentage data
		    	if(currentProgressData.role === "student" && $('div.ic-DashboardCard[data-reactid=".0.$' + currentProgressData.id + '"]').length > 0 && !isNaN(currentProgressData.percentage) && currentProgressData.percentage > 1){
		    		if(scriptDebug){
			    		console.log('Title: ' + currentProgressData.title);
			    		console.log('CourseID: ' + currentProgressData.id);
			    		console.log('Completed percent: ' + currentProgressData.percentageText);
			    		console.log('Has expected date: ' + currentProgressData.hasExpected);
			    		console.log('Has expected date: ' + currentProgressData.expectedProgressText);
			    	}
			    	//get the tile background colour
			    	primaryColour = $('div#DashboardCard_Container > div.ic-DashboardCard__box > div.ic-DashboardCard[data-reactid=".0.$' + currentProgressData.id + '"]').attr('style').split('border-bottom-color:').join('').split(';').join('');

			    	//create the html for progress bar
			    	progressBarHTML = '<div class="ic-DashboardCard__header_content progress_div"><p class="ic-DashboardCard__header-subtitle ellipsis">Progress</p><div class="progress-bar__bar-container" style="border: solid 1px ' + primaryColour + ';"><span style="text-align: center;  line-height: 18px; color:' + textColour + ';" class="progress_span"><div class="progress-bar__bar" style="width: 0px;background: ' + primaryColour +';" title = "Completed: ' + currentProgressData.percentageText + '" alt = "Completed: ' + currentProgressData.percentageText + '">' + currentProgressData.percentageText + '</div></span></div>';

			    	//insert the html into the dashboard tile
		    		$('div.ic-DashboardCard[data-reactid=".0.$' + currentProgressData.id + '"] > nav:first').before(progressBarHTML);
		    		//make the progress fancy
		    		$('div.ic-DashboardCard[data-reactid=".0.$' + currentProgressData.id + '"] > div.ic-DashboardCard__header_content.progress_div > div.progress-bar__bar-container > span.progress_span > div.progress-bar__bar').css('width');
		    		$('div.ic-DashboardCard[data-reactid=".0.$' + currentProgressData.id + '"] > div.ic-DashboardCard__header_content.progress_div > div.progress-bar__bar-container > span.progress_span > div.progress-bar__bar').css('width',(currentProgressData.percentageText.toString()));
		    	}
		    });
	    });

	    getProgress.error(function(){
			if(scriptDebug){console.log("Error getting course progress data, exiting.");}
			return false;
	    });
	}//*/
});

//function that returns a rounded value. If no decimal length is given, it rounds it to 1
function roundPercent(value, decLength) {
    if (decLength === undefined) decLength = 1;
    decLength = Math.pow(10, decLength || 0);
    return Math.round(value * decLength) / decLength;
}

//this function returns an object based on the courseData
//includes and calculates percentage, the expected percentage if there is any to calculate
function courseDataReturner(functionCourseData){
	
	var percentReturned = roundPercent((functionCourseData.course_progress.requirement_completed_count / functionCourseData.course_progress.requirement_count) * 100);
	var hasExpectedReturned = false;
	var expectedProgressReturned = null;

	//calculate the expected progress and set its true value
	if(functionCourseData.hasOwnProperty("start_at") && functionCourseData.hasOwnProperty("end_at") && functionCourseData.start_at != null && functionCourseData.end_at != null){
		hasExpectedReturned = true;
		expectedProgressReturned = calculateExpectedProgress(functionCourseData.start_at, functionCourseData.end_at);
	}

	var returnCourseData = {
		id : functionCourseData.id,
		percentage : percentReturned,
		percentageText : percentReturned + "%",
		hasExpected : hasExpectedReturned,
		expectedProgress : expectedProgressReturned,
		expectedProgressText : expectedProgressReturned + "%",
		role : functionCourseData.enrollments["0"].type,
		title : functionCourseData.name
	};
	return returnCourseData;
}

//calculate the expected return value
function calculateExpectedProgress(start, end) {
    var startTime = Date.parse(start);
    var startTimeMS = startTime.getTime();

    var endTime = Date.parse(end);
    var endTimeMS = endTime.getTime();

    var now = new Date();
    var nowMS = now.getTime();

    if(scriptDebug) console.log("Calculating expected progress.");
    var progress = (nowMS - startTimeMS) / (endTimeMS - startTimeMS);
    if(scriptDebug) console.log(progress);

    if(progress >= 0) {
        return progress;
    } 
    if(scriptDebug) console.log("No expected progress to display");
    return null;
}

//-------------- WIP ----------------------
//get the canvas completion data returned as on object
/*function getCanvasData(){
	var returnProgressData = {};

	// Set the global configs to synchronous 
	$.ajaxSetup({
	    async: false
	});
	
	//API call to get progress data for each course and return an array
	var getProgress = $.getJSON('https://'+ document.location.hostname +':443/api/v1/courses?include[]=course_progress&enrollment_type=student', function(data) {returnProgressData = data;});

	//if sucess return the progress data
	getProgress.success(function(){
		console.log('finished the getProgress')
		return true;
	});

	//if failed to get any data from the API call
	getProgress.error(function(){
		returnProgressData = false;
	});

	// Set the global configs back to asynchronous 
	$.ajaxSetup({
    	async: true
	});

	//return the progress data
	return returnProgressData;
}//*/
