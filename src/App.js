import React, {useState} from "react";
import readXlsxFile from 'read-excel-file'

import './App.css';

function App() {
  var file;
  const [data, setData] = useState(null);
  const [type, settype] = useState(null);
  const [loader, setloader] = useState(null);
  let cntRun = 0;

  function getxlxs(e) {
    file = e.target.files; // FileList object
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

              name = xlxsData[u][0] + " " + xlxsData[u][1];
              nickname = xlxsData[u][2];
              Facility = xlxsData[u][3];
              EmployeeNo = xlxsData[u][4];
              phone = xlxsData[u][5];
              Consent = xlxsData[u][6];

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
                totalItem++;
              }

              if (arLimite.length === 50) {
                arAskhrData.push(arLimite);
                arLimite = [];
              }

            }
            console.log('====================================');
            if (arAskhrData.length > 0) {
              arAskhrData.forEach((val) => {
                val.forEach((value) => {
                  saveData(value, totalItem);
                });
              });
            }
            console.log('====================================');
            if (arLimite.length > 0) {
              arLimite.forEach((value) => {
                saveData(value, totalItem);
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
      var url = "https://ra0353ccb7.execute-api.us-east-1.amazonaws.com/dev/askhr/add/employee";

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

          cntRun++;

          if (totalItem === cntRun) {
            setData("The number of records created successfully is " + cntRun);
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
        <div className="continer-fluid text-center mt-5">
          <div className="col-xs-12 col-md-12">
            <h1 className="site-title">AskHr App</h1>            
            <div id="Loader">
              {(loader === "load")?<div class="spinner-border text-primary spinner-border-sm" role="status"></div>:""}
              {(data)?(type === "error")?<div class="alert alert-warning mx-auto w-75" role="alert">{data}</div>:(type === "success")?<div class="alert alert-success mx-auto w-50" role="alert">{data}</div>:"":""}
            </div>
            <div id="feedback-msg" className="mx-auto w-50" />
          </div>
          <div className="row text-center">
            <div className="mx-auto w-50 card pb-5 mt-5 bg-dark shadow shadow-lg">
              <div className="col-12 text-center">
                
                <center>
                  <div className="form-group col-8">
                   
                    <div className="mb-3 mt-5 w-auto">
                      <div className="input-group ">
                        <label className="label mx-2 form-label" style={{ fontWeight: 'bold', color: 'azure' }}>Upload CSV:</label>
                        <input type="file" accept='.xlsx, .xls' name="askhrCSV" onChange={getxlxs} className="form-control border rounded" id="askhrCSV" />
                      </div>
                      <div className="askhrCSV-error text-danger" />
                    </div>
                    <button onClick={()=>(file)?createArrayTicketId(file):console.log("no File selected")} className=" btn btn-primary float-end border rounded btngetaskhr" id="btngetaskhr">
                      Run Process
                    </button>
                  </div>
                </center>
              </div>
            </div>
          </div>
          <div className="footer">
            <p>
              Copyright ©
              All rights reserved | This template is made <i className="icon-heart" aria-hidden="true" /> by <a href="https://illation.co.za" rel="noreferrer" style={{ color: '#718199' }} target="_blank">illation.co.za</a>
            </p>
          </div>
        </div>

      </header>
    </div>
  );
}

export default App;
