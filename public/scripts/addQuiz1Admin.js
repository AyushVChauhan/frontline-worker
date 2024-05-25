let count = 2;
let sum = 0;

function nextPage() {
    let errors = "Please fill out ";
    let marks_questions = [];
    let elements = document.getElementsByClassName("temp");
    for (let index = 0; index < elements.length; index += 2) {
        const element1 = elements[index];
        const element2 = elements[index + 1];
        if (element1.value && element2.value) {
            let marks = element1.value;
            let count = element2.value;
            marks_questions.push({ marks: marks, count: count });
            // console.log(marks_questions);
        } else {
            errors += "Marks,No.of Questions, ";
        }
    }

    let name = document.getElementById("quizname").value;
    if (!name) {
        errors += "Quiz Name, ";
    }

    let duration = document.getElementById("duration").value;
    if (!duration) {
        errors += "Duration Time, ";
    }

    let marks = document.getElementById("total").innerHTML;

    if (errors != "Please fill out ") {
        Swal.fire({
            icon: "error",
            text: errors.substring(0, errors.length - 2),
        });
    } else {
        $.ajax({
            type: "POST",
            url: "/admin/addQuiz/setQuiz",
            data: {
                name,
                duration,
                marks,
                marks_questions,
            },

            success: function (response) {
                location.href = "http://localhost:3000/admin/addQuiz/questions";
            },
        });
    }
}
function show() {
    $("#total").html(sum);
}
// FOR DISABLING ADD BUTTON ON EMPTY VALUE
function disableAdd() {
    let a = document.querySelectorAll(".temp");
    sum = 0;
    console.log(a);
    for (let i = 0; i <= a.length - 1; i = i + 2) {
        if (!a[i].value || a[i + 1].value == null) {
            document.getElementById("rowAdder").disabled = true;
        } else {
            document.getElementById("rowAdder").disabled = false;
        }
    }
    for (let i = 0; i <= a.length - 1; i = i + 2) {
        if (a[i].value && a[i + 1].value) {
            sum += parseInt(a[i].value) * parseInt(a[i + 1].value);
        }
    }
    if (sum) {
        $("#total").html(sum);
    }
}
function add() {
    // disableAdd();
    console.log("hi");
    newRowAdd =
        '<div class="input-group" id="inputGroup' +
        count +
        '" >' +
        '<input type="number" id="mark' +
        count +
        '" class="form-control mb-3 temp" oninput="disableAdd()" placeholder="Marks " name="mark' +
        count +
        '"/> ' +
        '<input type="number" id="count' +
        count +
        '" class="form-control mb-3 temp" oninput="disableAdd()" placeholder="No. of Questions " name="count' +
        count +
        '"/> </div>';
    $(".markcount").append(newRowAdd);
    count++;

    disableAdd();
}
function remove() {
    if ($(".markcount > div").length > 1) {
        // REMOVING OPTION TEXT FEILD
        document.querySelector(".markcount > :last-child").remove();

        count--;
    }
    disableAdd();
}
$(document).ready(function () {
    disableAdd();
});
