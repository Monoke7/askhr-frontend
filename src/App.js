//import logo from './logo.svg';
//import xlsx from 'xlsx';
//import * as XLSX from './js/xlsx';
import React, {useState} from "react";
import readXlsxFile from 'read-excel-file'

import './App.css';

var file;
var arAskhrData = [];

function App() {
  const [data,setData] = useState(null);

  function getxlxs(e){
    file = e.target.files; // FileList object
  }
  
  function createArrayTicketId(files) {
  
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
  
              arAskhrData.push(askhr_fields);
            }
  
  
            console.log('====================================');
            saveData(arAskhrData);
            console.log('====================================');
  
  
          } else {
            setData("The Excel file format given is not recognized. {Missing required Header}");
  
          }
          
        })
      } catch (error) {
        console.log(error);
      }
    }
  
    handleFileSelect();
  }
  
  function saveData(data) {
  
    if (data.length > 0) {
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
  
          if (error_details.length <= 0) {
            setData("The number of records created successfully is " + count_added);
  
          } else {
            setData("The number of records created successfully is " + count_added + ", and the number of records failed is " + error_details.length);
          }
          
          console.log(result)
        })
        .catch(error => console.log('error', error));
  
  } else {
    setData("We could not find records in the given file.");
  } 
  
  }


  return (
    <div className="App">
      <header className="App-header">
        <div className="continer-fluid text-center mt-5">
          <div className="col-xs-12 col-md-12">
            <h1 className="site-title">AskHr App</h1>
            <div id="Loader">
            {(data)?<div class="alert alert-warning mx-auto w-50" role="alert">{data}</div>:""}
            </div>
            {/*button id="export" class="btn btn-primary border-white" disabled><img src="images/Export_CSV.png" width="18" height="18" />Export as CSV</button*/}
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
