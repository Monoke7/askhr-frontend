var btnRunProcess = document.getElementsByName("btngetaskhr");

btnRunProcess.addEventListener("click", () => {
    $("#Loader").empty();
    $("#Loader").append('<div hidden id="processLoader" class="spinner-border text-primary spinner-border-sm" role="status"></div>');

    var csvFile = document.getElementById("askhrCSV");
    var msgData;

    if (csvFile.files[0]) {
        var extension = csvFile.files[0].name;
        extension = extension.split(".");
    }

    if (!csvFile.files[0] || csvFile.files[0].name === "") {
        msgData = "Please provide a file to be process.";
        $(".askhrCSV-error").html(msgData);
        $("#askhrCSV").addClass("border border-danger");
    } else if (extension[1] !== "xlsx") {
        msgData = "The file provided is not an excel file.";
        $(".askhrCSV-error").html(msgData);
        $("#askhrCSV").addClass("border border-danger");
    } else {

        $(".userCSV-error").html("");
        $("#userCSV").removeClass("border border-danger");
        $('#export').attr("disabled", "true");
        $('#processLoader').removeAttr("hidden");


        createArrayTicketId(csvFile);

    }
});

function createArrayTicketId(csv_File) {

    var ExcelToJSON = function() {

        this.parseExcel = function(file) {
            var reader = new FileReader();

            reader.onload = function(e) {
                var message = "";
                var data = e.target.result;
                var workbook = XLSX.read(data, {
                    type: 'binary'
                });
                workbook.SheetNames.forEach(function(sheetName) {
                    // Here is your object
                    var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                    var json_object = JSON.stringify(XL_row_object);

                    var json_xlsx = JSON.parse(json_object);

                    var xlsx_Header = (json_xlsx[0]) ? Object.keys(json_xlsx[0]) : null;

                    if (xlsx_Header != null && (xlsx_Header[0] === "Last Name" && xlsx_Header[1] === "Known As" &&
                            xlsx_Header[2] === "Facility" && xlsx_Header[3] === "Employee number" && xlsx_Header[4] === "Mobile Phone No" &&
                            xlsx_Header[5] === "Consent")) {

                        var name = "";
                        var nickname = "";
                        var Facility = "";
                        var EmployeeNo = "";
                        var phone = "";
                        var Consent = "";

                        var arAskhrData = [];

                        json_xlsx.forEach((val, ind) => {
                            name = val["Last Name"];
                            nickname = val["Known As"];
                            Facility = val["Facility"];
                            EmployeeNo = val["Employee number"];
                            phone = val["Mobile Phone No"];
                            Consent = val["Consent"];

                            var askhr_fields = ({
                                "name": name,
                                "nickname": nickname,
                                "facility": Facility,
                                "empNum": EmployeeNo,
                                "phoneNo": phone,
                                "consent": Consent
                            });

                            arAskhrData.push(askhr_fields);

                        });

                        if (arAskhrData.length > 0) {
                            console.log(arAskhrData);
                            //saveData(arAskhrData);

                        } else {
                            message = "We could not find records in the given file.";
                            $("#feedback-msg").append('<div class="alert alert-warning mx-auto w-50" role="alert">' + message + '</div>');
                        }
                    } else {
                        message = "The Excel file format given is not recognized. {Missing required Header}";
                        $("#feedback-msg").append('<div class="alert alert-danger mx-auto w-50" role="alert">' + message + '</div>');
                    }

                });

            };

            reader.onerror = function(ex) {
                console.log(ex);
            };

            reader.readAsBinaryString(file);
        };
    };

    function handleFileSelect() {

        var files = csv_File.files; // FileList object
        var xl2json = new ExcelToJSON();
        xl2json.parseExcel(files[0]);
    }

    handleFileSelect();
}

function saveData(data) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var url = "https://ra0353ccb7.execute-api.us-east-1.amazonaws.com/dev/askhr/add_many/employee";

    var raw = JSON.stringify(data);

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch(url, requestOptions)
        .then(response => response.text())
        .then(result => {
            var error_details = result["error_details"];
            var count_added = result["count_added"];
            var message = "";

            if (error_details.length <= 0) {
                message = "The number of records created successfully is " + count_added;

            } else {
                message = "The number of records created successfully is " + count_added + ", and the number of records failed is " + error_details.length;
            }
            $("#feedback-msg").append('<div class="alert alert-warning mx-auto w-50" role="alert">' + message + '</div>');
            $("#Loader").empty();
            $("#Loader").append('<i class="bi bi-check"></i>');
            console.log(result)
        })
        .catch(error => console.log('error', error));


}