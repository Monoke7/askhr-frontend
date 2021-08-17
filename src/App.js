import React, {useState} from "react";
import readXlsxFile from 'read-excel-file'
import logo from "./logo192.png"

import './App.css';
var file;

function App() {
  
  const [data, setData] = useState(null);
  const [type, settype] = useState(null);
  const [loader, setloader] = useState(null);
  let cntRun = 0;
  let cntFailed = 0;
  let cntSuccess = 0;

  function getxlxs(e) {
    file = e.target.files; 
    //FileList object
    //console.log(file);
    settype("");
  }

  function createArrayTicketId(files) {
    var arAskhrData = [];
    setloader("load");
    function handleFileSelect() {

      try {
        readXlsxFile(files[0]).then((rows) => {
          // `rows` is an array of rows    // each row being an array of cells.
          var xlxsData = rows;
          var xlxsheader = xlxsData[0];

          if (xlxsheader != null && (xlxsheader[0] === "First Name" && xlxsheader[1] === "Last Name" && xlxsheader[2] === "Known As" &&
            xlxsheader[3] === "Facility" && xlxsheader[4] === "Employee number" && xlxsheader[5] === "Mobile Phone No" &&
            xlxsheader[6] === "Consent")) {

            var name = "";
            var nickname = "";
            var Facility = "";
            var EmployeeNo = "";
            var phone = "";
            var Consent = "";
            var arLimite = [];
            var totalItem = 0;
            for (var u = 1; u < xlxsData.length; u++) {

              name = (xlxsData[u][0] || xlxsData[u][1])?(xlxsData[u][0] + " " + xlxsData[u][1]): 1;
              nickname = xlxsData[u][2]? xlxsData[u][2] + "" : 2;
              Facility = xlxsData[u][3]? xlxsData[u][3] + "":3;
              EmployeeNo = xlxsData[u][4]?xlxsData[u][4] + "":4;
              phone = xlxsData[u][5]?xlxsData[u][5] + "":5;
              Consent = xlxsData[u][6]?xlxsData[u][6] + "":6;

              var askhr_fields = ({
                "name": name,
                "nickname": nickname,
                "facility": Facility,
                "empNum": EmployeeNo,
                "phoneNo": phone,
                "consent": Consent
              });
              if (askhr_fields.empNum) {
                arLimite.push(askhr_fields);
                
              }

              if (arLimite.length === 200) {
                arAskhrData.push(arLimite);
                totalItem++;
                arLimite = [];
              }

            }
            console.log('====================================');
            if (arAskhrData.length > 0) {

              if (arLimite.length > 0) {
                arAskhrData.push(arLimite);
                totalItem++;
              }


              arAskhrData.forEach((val) => {
                 saveData(val, totalItem);
              });
            }
            console.log('====================================');

          } else {
            setData("The Excel file format given is not recognized. {Missing required Header}");
            settype("error");
            setloader("");
          }

        })
      } catch (error) {
        console.log(error);
        setData("Something went wrong while extracting the file.");
        settype("error");
        setloader("");
      }
    }

    handleFileSelect();
  }

  function saveData(data, totalItem) {

    if (data) {
      var myHeaders = new Headers();
      
      myHeaders.append("Content-Type", "application/json");
       myHeaders.append("Access-Control-Allow-Origin", "*");
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
          result = JSON.parse(result);
          

          cntRun++;

          if(result){
            var {count_added, error_details} = result;

            cntFailed += error_details.length;
            cntSuccess += count_added;
          }

          if (totalItem === cntRun) {
            if(cntFailed !== 0){
              let totalProcess = (cntSuccess + cntFailed);
              setData("The total number of records processed is " + totalProcess + ", successfully created is " + cntSuccess + ", not created because of record format is " + cntFailed);
            }else{
              setData("The number of records successfully created is " + cntSuccess);
            }
            settype("success");
            setloader("");
          }

        })
        .catch(error => {
          console.log('error', error);
          setData("Something went wrong while inserting the data.");
          settype("error");
          setloader("");
        });
    } else {
      setData("We could not find records in the given file.");
      settype("error");
      setloader("");
    }

  }


  return (
    <div className="App">
      <header className="App-header">
        <div className="continer-fluid text-center mb-2 w-50">
          <div className="col-xs-12 col-md-12">
            <img
              src={logo}
              className="App-logo"
              alt="logo"
              width=""
              height=""
            />
            <h1 className="site-title">AskHR Contact Information Portal</h1>
            <div id="Loader">
              {loader === "load" ? (
                <div
                className="spinner-border text-primary spinner-border-sm"
                  role="status"
                ></div>
              ) : (
                ""
              )}
              {data ? (
                type === "error" ? (
                  <div className="alert alert-warning mx-auto w-75" role="alert">
                    {data}
                  </div>
                ) : type === "success" ? (
                  <div className="alert alert-success mx-auto w-50" role="alert">
                    {data}
                  </div>
                ) : (
                  ""
                )
              ) : (
                ""
              )}
            </div>
            <div id="feedback-msg" className="mx-auto w-50" />
          </div>
          <div className="row text-center mb-2">
            <div className="mx-auto w-100 card pb-5 bg-transparent shadow shadow-lg">
              <div className="col-12 text-center">
                <center>
                  <div className="form-group col-8 mt-5">
                    <div className="mb-3 mt-2 w-auto">
                      <div className="input-group ">
                        <label
                          className="label mx-2 form-label"
                          style={{ fontWeight: "bold", color: "azure" }}
                        >
                          Upload CSV:
                        </label>
                        <input
                          type="file"
                          accept=".xlsx, .xls"
                          name="askhrCSV"
                          onChange={getxlxs}
                          className="form-control border rounded"
                          id="askhrCSV"
                        />
                      </div>
                      <div className="askhrCSV-error text-danger" />
                    </div>
                    <button
                      onClick={() =>
                        file
                          ? createArrayTicketId(file)
                          : console.log("no File selected" + file)
                      }
                      className=" btn float-end border rounded btngetaskhr"
                      id="btngetaskhr"
                      style={{backgroundColor:"#647687", color:"white"}}
                    >
                      Import Uploaded Files
                    </button>
                  </div>
                </center>
              </div>
            </div>
          </div>
        </div>
        <div className="card accordion-item" style={{backgroundColor:"#647687"}}>
          <div className="card-header accordion-header" id="headingOne">
            <h5 className="mb-0 ">
              <button
                className="btn accordion-button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseOne"
                aria-expanded="true"
                aria-controls="collapseOne"
              >
               To Import excel Files (.xlsx) format, please follow the steps.
              </button>
            </h5>
          </div>

          <div
            id="collapseOne"
            className="accordion-collapse collapse"
            aria-labelledby="headingOne"
            data-parent="#accordion"
          >
            <div className="card-body accordion-body">
              <div className="form-inline form-control mt-1" id="Selected-HCP">
                <ol className="list-styled">
                  <li>Click on choose file button.</li>
                  <li>Locate the file from the file location.</li>
                  <li>Click on open.</li>
                  <li>The file should appear in the box with the file name.</li>
                  <li>Click on the "Import Uploaded File" button.</li>
                  <li>You will receive a message indicating the result state of the process.</li>
                </ol>

              </div>
            </div>
          </div>
        </div>
        <div
          className="footer mt-3"
          style={{ marginTop: "200px", fontSize: 18 }}
        >
          <p>
            Copyright © All rights reserved | Application Developed by{" "}
            <a
              href="https://illation.co.za"
              rel="noreferrer"
              style={{ color: "#718199" }}
              target="_blank"
            >
              illation
            </a>
          </p>
        </div>
      </header>
    </div>
  );
}

export default App;
