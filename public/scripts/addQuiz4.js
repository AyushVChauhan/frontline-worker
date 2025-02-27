let selectedQuestions = [];
allQuestions.forEach((ele) => {
    ele.random = 1;
    selectedQuestions.push(ele);
});
function adder(e) {
    let id = e.getAttribute("data-id");
    

    let flag = 0;
    selectedQuestions.forEach((ele, ind) => {
        if (ele._id == id && ele.random == 0) {
            e.innerHTML = "<i class='fa-solid fa-plus text-success ms-4'></i>";
            ele.random = 1;
            flag = 1;
            return;
        } else if (ele._id == id && ele.random == 1) {
            e.innerHTML = "<i class='fa-solid fa-minus text-danger ms-4'></i>";
            ele.random = 0;
            flag = 1;
            return;
        }
    });
    renderCos();
}
function renderCos() {
    let allMarks = [];
    console.log(selectedQuestions);
    marks_questions.forEach((ele) => {
        allMarks.push({ marks: ele.marks, count: 0 });
    });
    allMarks.forEach((element) => {
        selectedQuestions.forEach((ele) => {
            if (ele.random == 0 && ele.marks == element.marks) {
                element.count++;
            }
        });
    });
    console.log(allMarks);
    let body = ``;
    allMarks.forEach((ele) => {
        if (ele.count > 0) {
            body += `<div class="accordion-item"><h2 class="accordion-header"><button
                        class="accordion-button"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#CO${ele.marks}"
                        aria-expanded="true"
                        aria-controls="CO${ele.marks}"
                    >
                        Marks-${ele.marks} -- ${ele.count}
                    </button>
                </h2>
                <div
                    id="CO${ele.marks}"
                    class="accordion-collapse collapse show"
                    data-bs-parent="#coDiv"
                >
                    <div class="accordion-body"><ol>`;
            selectedQuestions.forEach((element) => {
                if (element.marks == ele.marks && element.random == 0) {
                    body += `<li>${element.question}</li>`;
                }
            });
            body += "</ol></div></div></div>";
        }
    });
    $("#coDiv").html(body);

    // console.log(body);
}
function seer(e) {
    let id = e.getAttribute("data-id");
    $.ajax({
        type: "POST",
        url: "/coordinator/questionDetail",
        data: { id },
        success: function (response) {
            // console.log(response);
            let data = response.questionDetail;
            let subnameqdetail = null;
            let moduleDetail = null;
            let topicqdetail = [];

            data.topicId.forEach((element) => {
                moduleDetail = element.moduleId.moduleName;
                topicqdetail.push(element.topic);
                subnameqdetail = element.moduleId.subjectId.name;
            });
            console.log(data);
            let typeqdetail = null;
            let difficultyqdetail = null;
            if (data.type == 1) {
                typeqdetail = "MCQ";
            }
            if (data.type == 2) {
                typeqdetail = "One Word";
            }
            if (data.type == 3) {
                typeqdetail = "Descriptive";
            }
            if (data.difficulty == 1) {
                difficultyqdetail = "Easy";
            }
            if (data.difficulty == 2) {
                difficultyqdetail = "Medium";
            }
            if (data.difficulty == 3) {
                difficultyqdetail = "Hard";
            }
            let html =
                "<div class='question'><div class='modalQuestion me-2'><h4><b>Question :</b></h4></div><div class='modalQuestion'> " +
                data.question +
                `</div></div>`;

            if (data.type == 1) {
                html +=
                    " <div class='row' ><div class='modalQuestion col-auto'><h4><b>Option :</b></h4></div><div class='modalQuestion col'><ol style='list-style-type: upper-alpha;font-size:20px'>";

                data.options.forEach((element) => {
                    if (element.option == data.answer)
                        html +=
                            "<li style='color:green;'>" +
                            element.option +
                            "</li>";
                    else html += "<li>" + element.option + "</li>";
                });
                html += "</ol></div>";
            }

            html +=
                "<div><div class='modalQuestion me-2'><h4><b>Answer :</b></h4></div><div class='modalQuestion' style='color:green; font-size: 20px '> " +
                data.answer +
                "</b></div></div></div><div><div class='modalQuestion me-2'><h4><b>Marks :</b></h4></div><div class='modalQuestion'> " +
                data.marks +
                "</div></div></div><div><div class='modalQuestion me-2'><h4><b>Type :</b></h4></div><div class='modalQuestion'> " +
                typeqdetail +
                "</div></div></div><div><div class='modalQuestion me-2'><h4><b>Difficulty:</b></h4></div><div class='modalQuestion'> " +
                difficultyqdetail +
                "</div></div></div><div><div class='modalQuestion me-2'><h4><b>Subject:</b></h4></div><div class='modalQuestion'> " +
                subnameqdetail +
                "</div></div></div><div><div class='modalQuestion me-2'><h4><b>Module : </b></h4></div><div class='modalQuestion'> " +
                moduleDetail +
                "</div></div></div><div class='row'><div class='modalQuestion col-auto'><h4><b>Topic :</b></h4></div><div class='modalQuestion col'><ul> ";
            topicqdetail.forEach((ele) => {
                html += `<li>${ele}</li>`;
            });
            html +=
                "</ul></div></div></div><div><div class='modalQuestion me-2'><h4><b>Time required(in Seconds) :</b></h4></div><div class='modalQuestion'>" +
                data.time_required;
            html +=
                "</div></div></div><div><div class='modalQuestion me-2'><h4><b>Created By :</b></h4></div><div class='modalQuestion'>" +
                data.created_by.username +
                "</div></div></div>";
            $(".modal-body").html(html);
            // $('#largeModal').modal('show');
            $("#questionDetailModal").modal("show");
        },
    });
}
function generateDataTable() {
    let selectedMarks = $("#marksSelect").val();
    let arr = ["mark", "type", "question"];
    let def =
        "<table class='uk-table uk-table-hover uk-table-striped text-center' id='datatable'><thead><th>Sr No.</th>";

    if (arr.includes("type")) {
        def += "<th>Type</th>";
    }
    if (arr.includes("subject")) {
        def += "<th>Subject</th>";
    }
    if (arr.includes("question")) {
        def += "<th>Question</th>";
    }
    if (arr.includes("mark")) {
        def += "<th>Mark</th>";
    }
    if (arr.includes("difficulty")) {
        def += "<th>Difficulty</th>";
    }
    if (arr.includes("createdby")) {
        def += "<th>Created By</th>";
    }
    def += "<th>Action</th>";
    def += "</thead>";
    let data = "";
    let type1 = null;
    let subject1 = null;
    let ind = 1;
    selectedQuestions.forEach((ele) => {
        if (selectedMarks == "All" || selectedMarks == ele.marks) {
            if (ele.type == 1) {
                type1 = "MCQ";
            }
            if (ele.type == 2) {
                type1 = "ONE WORD";
            }
            if (ele.type == 3) {
                type1 = "DESCRIPTIVE";
            }
            data += "<tr>";
            // SRNO
            data += `<td>${ind++}</td>`;

            if (arr.includes("type")) {
                data += `<td>${type1}</td>`;
            }

            if (arr.includes("subject")) {
                let subject1 = ele.topicId[0].moduleId.subjectId.name;
                data += `<td>${subject1}</td>`;
            }

            if (arr.includes("question")) {
                data += `<td class="add-read-more show-less-content">${ele.question}</td>`;
            }

            if (arr.includes("mark")) {
                data += `<td>${ele.marks}</td>`;
            }

            // if (arr.includes("co")) {
            //     data += `<td>${ele.course_outcome_id[0].course_outcome}</td>`;
            // }

            if (arr.includes("difficulty")) {
                let diff =
                    ele.difficulty == "1"
                        ? "Easy"
                        : ele.difficulty == "2"
                        ? "Medium"
                        : "Hard";
                data += `<td>${diff}</td>`;
            }
            if (arr.includes("createdby")) {
                data += `<td>${ele.created_by.username}</td>`;
            }

            data += `<td><a data-id='${ele._id}' onclick='seer(this)' class='see' ><i class='fa-solid fa-eye text-dark'></i></a><a data-id='${ele._id}' onclick='adder(this)' class='adder' ><i class='fa-solid fa-plus ms-4 text-success' ></i></a></td>`;
            data += "</tr>";
        }
    });
    $("#tableDiv").html(def + data + "</table>");
    var myTable;

    myTable = $("#datatable").DataTable({
        pagingType: "simple_numbers",
        language: {
            paginate: {
                previous: "<",
                next: ">",
            },
        },
    });
    // abc();
}
function plusMinus() {
    let elements = document.getElementsByClassName("adder");
    // console.log(elements.length);
    for (let index = 0; index < elements.length; index++) {
        const element = elements[index];
        let id = element.getAttribute("data-id");
        // console.log(id);
        selectedQuestions.forEach((ele) => {
            // console.log(ele._id+""+id);
            if (ele._id == id) {
                element.innerHTML =
                    "<i class='fa-solid fa-minus text-danger ms-4'></i>";
                return;
            }
        });
    }
}
function nextPage(){
    let allMarks = [];
    let flag=[];
    // console.log(selectedQuestions);
    marks_questions.forEach((ele) => {
        allMarks.push({ marks: ele.marks, count: 0 });
    });
    selectedQuestions.forEach(element=>{
        allMarks.forEach(ele=>{
            if(ele.marks==element.marks&&(element.random==0)){
                ele.count++;
                return;
            }
        })
    })
    allMarks.forEach(element=>{
        marks_questions.forEach(ele=>{
            if(ele.marks==element.marks&&ele.count<element.count){
                flag.push({marks:ele.marks,count:element.count});
                return;
            }
        })
    })
    if(flag.length){
        let text=``;
        flag.forEach(element => {
            text+=`Can not add ${element.count} questions of ${element.marks} marks`
        });
        Swal.fire({title:"Question Alert",text:text,icon:"warning"})
    }
    else{
        console.log(selectedQuestions);
        let mySelectedQuestions = selectedQuestions.map(ele=>{
            return {marks:ele.marks, _id:ele._id,random:ele.random};
        })
        $.ajax({
            type: "post",
            url: "/coordinator/addQuiz/setCompulsaryQuestions",
            data: {selectedQuestions:mySelectedQuestions},
            success: function (response) {
                if(admin == 0)
                {
                    window.open("/coordinator","_self")
                }
                else
                {
                    window.open("/admin","_self")
                }
                
            }
        });
    }
}
$(document).ready(function () {
    generateDataTable();
});
