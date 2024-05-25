function openSidebar() {
    let sidebar = document.getElementsByClassName("sidebar")[0];
    $("#sidebar").toggleClass("sidebar-open");
    console.log($(".main-container").css("opacity"));
    if ($(".main-container").css("opacity") === "0.5")
        $(".main-container").css("opacity", "100%");
    else $(".main-container").css("opacity", "50%");
}
$(document).ready(function () {
    let path = window.location.pathname;
    let arr = path.split("/");
    if (arr.includes("subjectAnalysis")) {
        $("#subjectAnalysis").toggleClass("hovered");
    } else if (arr.includes("scoreAnalysis")) {
        $("#scoreAnalysis").toggleClass("hovered");
    } else if (arr.includes("leaderboard")) {
        $("#leaderboard").toggleClass("hovered");
    } else if (arr.includes("quizzes")) {
        $("#quizzes").toggleClass("hovered");
    } else if (arr.includes("certificates")) {
        $("#certificates").toggleClass("hovered");
    } else {
        $("#dashboard").toggleClass("hovered");
    }
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(";").shift();
    }
    let name = getCookie("name");
    document.getElementById("myUsername").innerHTML = name;
});
