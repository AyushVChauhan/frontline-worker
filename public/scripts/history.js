$(document).ready(function () {
    quizzes.forEach((element) => {
        let totalMarks = 0;
        let questionAnswers = element.questions_answers;
        questionAnswers.forEach((question) => {
            if (question.question.caseSensitive == 1)
            {
                if(question.question.answer == question.answer)
                {

                    marks = markOfThisQuestion;
                }
            }
            else {
                if(question.question.answer.toUpperCase() ==
                question.answer.toUpperCase())
                {
                    marks = markOfThisQuestion;

                }
            }
        });
        if(questionAnswers.length != 0)
        {
            $(`#${element._id}`).html(totalMarks + "/" + element.quiz_id.marks);
        }
        else {
            $(`#${element._id}`).html("Pending");
        }
    });

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
});
