
import { useEffect, useState } from "react";
import Datatable from "../datatable/datatable";
import { getEquipmentListService, getEquipmentLogMasterListById } from "../../services/masterservice";
import EquipmentLogAddEditComponent from "./equipmentLogAddEditComponent";
import "../datatable/master.css";

import { Link } from "react-router-dom";
import Navbar from "../navbar/navbar";
import formatDate from "../../common/dateFormatter";
import { FaEdit, FaFileExcel, FaFilePdf } from "react-icons/fa";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import Select from "react-select";
import { printEquipmentUsageLog } from "../print/equipmentUsageLogPrint";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";


const getMinDate = () => {
  const currentDate = new Date();
  const minYear = currentDate.getFullYear();
  const fyStartYear = currentDate.getMonth() < 3 ? minYear - 1 : minYear;

  return new Date(fyStartYear, 3, 1);
};

const getMaxDate = () => {
  const currentDate = new Date();
  const maxYear = currentDate.getFullYear();
  const fyEndYear = currentDate.getMonth() < 3 ? maxYear : maxYear + 1;

  return new Date(fyEndYear, 2, 31);
};




const EquipmentLog = () => {

  const [equipmentLogList, setEquipmentLogList] = useState([]);
  const [status, setStatus] = useState('');
  const [equpmentLogId, setEqupmentLogId] = useState('');
  const [equipmentList, setEquipmentList] = useState([]);
  const [equipmentValue, setEquipmentValue] = useState('');
  const [equipmentName, setEquipmentName] = useState('');

  const [fromDateValue, setFromDateValue] = useState(getMinDate());
  const [toDateValue, setToDateValue] = useState(getMaxDate());



  const columns = [
    { name: "SN", selector: (row) => row.sn, sortable: true, align: 'text-center' },
    { name: "Start Time", selector: (row) => row.startTime, sortable: true, align: 'text-center' },
    { name: "End Time", selector: (row) => row.endTime, sortable: true, align: 'text-center' },
    { name: "Total Hours", selector: (row) => row.totalHours, sortable: true, align: 'text-end' },
    { name: "Description", selector: (row) => row.description, sortable: true, align: 'text-center', },
    { name: "Used By", selector: (row) => row.usedByName, sortable: true, align: 'text-center', },
    { name: "Action", selector: (row) => row.action, sortable: true, align: 'text-center', },
  ];

  const editEquipmentLog = async (id) => {
    setEqupmentLogId(id);
    setStatus('edit');
  }

  const addEquipmentLog = async () => {
    setStatus('add');
  }

  useEffect(() => {
    getEquipmentMasterList();
  }, []);

  useEffect(() => {
    if (equipmentValue && fromDateValue && toDateValue) {
      fetchEquipmentLogMasterListById(equipmentValue, fromDateValue, toDateValue);
    }
  }, [equipmentValue, fromDateValue, toDateValue]);

  useEffect(() => {
    if (equipmentList.length > 0 && (!equipmentValue || equipmentValue === "")) {
      setEquipmentValue(equipmentList[0].equipmentId);
      setEquipmentName(equipmentList[0].equipmentName);

    }
  }, [equipmentList]);

  const fetchEquipmentLogMasterListById = async (equipmentValue, fromDateValue, toDateValue) => {
    try {
      const fromdate = format(new Date(fromDateValue), "yyyy-MM-dd'T'HH:mm:ss");
      const todate = format(new Date(toDateValue), "yyyy-MM-dd'T'HH:mm:ss");
      const data = await getEquipmentLogMasterListById(equipmentValue, fromdate, todate);
      if (!data) return;
      if (Array.isArray(data) && data.length > 0) {
        setTableData(data);
      } else {
        setTableData([]);
      }

    } catch (err) {
      console.error("Failed to fetch equipment log data:", err);
    }
  };

  const getEquipmentMasterList = async () => {
    try {
      const data = await getEquipmentListService();
      if (Array.isArray(data) && data.length > 0) {
        setEquipmentList(data);
      } else {
        setEquipmentList([]);
        console.error("Equipment list is empty or invalid.");
      }
    } catch (error) {
      console.error("Error fetching equipment list:", error);
      setEquipmentList([]);
    }
  };

  const equipmentOptions = equipmentList.map(equip => ({
    value: equip.equipmentId,
    label: equip.equipmentName
  }));



  const setTableData = (data) => {
    setEquipmentLogList(
      data.map((item, index) => ({
        sn: index + 1 + '.',
        //equipmentName: item.equipmentName? item.equipmentName : '-',
        startTime: item.startTime ? formatDate(item.startTime) : '-',
        endTime: item.endTime ? formatDate(item.endTime) : '-',
        totalHours: item.totalHours != null ? `${item.totalHours}` : '-',
        description: item.description ? item.description : '-',
        usedByName: item.usedByName ? item.usedByName : '-',
        action: (
          <button className="btn btn-warning btn-sm me-1" onClick={() => item.id != null && editEquipmentLog(item.id)} title="Edit Equipment Log">
            <FaEdit size={16} />
          </button>
        ),
      }))
    );
  };


  const handleEquipChange = (data) => {
    setEquipmentValue(data?.value);
    setEquipmentName(data?.label);
  };

    const handleEquipmentUsageLogPdf = async() => {

      await printEquipmentUsageLog(equipmentLogList,equipmentName,fromDateValue,toDateValue);
    
  }


  const handleEquipmentUsageLogExcel = () => {
    //const data = equipmentLogList,equipmentName,fromDateValue,toDateValue;
    //if (!data.length) return alert("No attendance records!");

     if (!equipmentLogList || equipmentLogList.length === 0)
        return alert("No records!");

    const formattedFrom = format(fromDateValue, "dd-MM-yyyy");
    const formattedTo = format(toDateValue, "dd-MM-yyyy");

    const excelData = equipmentLogList.map((d) => ({
        SN: d.sn,
        
        "Start Time": d.startTime,
        "End Time": d.endTime,
        "Total Hrs":d.totalHours,
        "Description":d.description,
         "Used By":d.usedByName
        
    }));

    // 🟦 Create worksheet & place table starting at row 4
    const worksheet = XLSX.utils.json_to_sheet(excelData, { origin: "A4" });
    const totalColumns = Object.keys(excelData[0]).length;

    // 🟦 Add Title rows
    XLSX.utils.sheet_add_aoa(
        worksheet,
        [
            [`Equipment Usage Log Report`],
           [`Equipment: ${equipmentName}    |    From: ${formattedFrom}   To: ${formattedTo}`]
            
        ],
        { origin: "A1" }
    );

    // 🟦 Merge Title & Date rows
    worksheet["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: totalColumns - 1 } }, // Title
        { s: { r: 1, c: 0 }, e: { r: 1, c: totalColumns - 1 } }, // Date Row
    ];

    // 🟦 Column width auto adjust
    worksheet["!cols"] = Object.keys(excelData[0]).map((key) => ({
        wch: Math.max(15, key.length + 5),
    }));

    // 🟦 Style Title
    const titleCell = worksheet["A1"];
    if (titleCell) {
        titleCell.s = {
            font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
            alignment: { horizontal: "center", vertical: "center" },
            fill: { fgColor: { rgb: "4472C4" } },
        };
    }

    // 🟦 Style Date Row
    const dateCell = worksheet["A2"];
    if (dateCell) {
        dateCell.s = {
            font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
            alignment: { horizontal: "center", vertical: "center" },
            fill: { fgColor: { rgb: "5B9BD5" } },
        };
    }

    // 🟦 Style table headers (Row 4)
    const headerRowNumber = 4;
    Object.keys(excelData[0]).forEach((_, colIndex) => {
        const cellRef = XLSX.utils.encode_cell({
            r: headerRowNumber - 1,
            c: colIndex,
        });
        const cell = worksheet[cellRef];

        if (cell) {
            cell.s = {
                font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
                alignment: { horizontal: "center", vertical: "center" },
                fill: { fgColor: { rgb: "1C6EA4" } },
                border: {
                    top: { style: "thin", color: { rgb: "000000" } },
                    bottom: { style: "thin", color: { rgb: "000000" } },
                    left: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } },
                },
            };
        }
    });

    // 🟦 Create workbook & save file
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Equipment Usage Log Report");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(
        new Blob([excelBuffer]),
        `Equipment_Usage_Report_${equipmentName}.xlsx`
    );

    
};

  switch (status) {
    case 'add':
      return <EquipmentLogAddEditComponent mode={'add'} equipmentValue={equipmentValue} equipmentName={equipmentName}></EquipmentLogAddEditComponent>;
    case 'edit':
      return <EquipmentLogAddEditComponent mode={'edit'} equpmentLogId={equpmentLogId} equipmentName={equipmentName} ></EquipmentLogAddEditComponent>;
    default:
      return (

        <div>
          <Navbar />
          <div className="card p-2">
            <div className="card-body text-center">
              <h3>Equipment Usage Log List</h3>
              <br></br>


              <div className="row justify-ontent-center align-items-center rowHeadercolor">
                <div className="col-md-12 d-flex justify-content-end  align-items-center flex wrap">
                  <div className="d-flex align-items-center me-4 mb-2">
                     <label htmlFor="equipmentId" className="font-label me-2 mb-0"> Equipment: &nbsp;</label>
                     <div className="text-start " style={{width:"400px"}}>
                    <Select
                       options={equipmentOptions}
                      value={equipmentOptions.find(opt => opt.value === Number(equipmentValue)) || null}
                      // onChange={(selected) => setEquipmentValue(selected ? selected.value : "")}
                      onChange={(data) => handleEquipChange(data)}

                    />
                     </div>
                  </div>


                  <div className="d-flex align-items-center me-4 mb-2" >

                    <label htmlFor="fromDate" className="font-label me-2 mb-0">From:</label>

                    <DatePicker
                      selected={fromDateValue}
                      onChange={(newValue) => {
                        setFromDateValue(newValue);
                      }}
                      className="form-control"
                      placeholderText="Select From Date"
                      dateFormat="dd-MM-yyyy"
                      showYearDropdown
                      showMonthDropdown
                      dropdownMode="select"
                      //minDate={getMinDate()}
                      //maxDate={getMaxDate()}
                      onKeyDown={(e) => e.preventDefault()}
                    />
                  </div>

                  <div className="d-flex align-items-center me-4 mb-2" >
                    <label htmlFor="toDate" className="font-label me-2 mb-0">To:</label>

                    <DatePicker
                      selected={toDateValue}
                      onChange={(newValue) => {
                        setToDateValue(newValue);
                      }}


                      className="form-control"
                      placeholderText="Select To Date"
                      dateFormat="dd-MM-yyyy"
                      showYearDropdown
                      showMonthDropdown
                      dropdownMode="select"
                      minDate={getMinDate()}
                      //maxDate={getMaxDate()}

                      onKeyDown={(e) => e.preventDefault()}
                    />
                  </div>

                  <button type="submit" className="btn btn-danger me-2" onClick={() => handleEquipmentUsageLogPdf()}>
                    <FaFilePdf size={18} />
                  </button>

                  <button type="submit" className="btn btn-success"  onClick={() => handleEquipmentUsageLogExcel()}>
                    <FaFileExcel size={18} />
                  </button>

                </div>
              </div>


              <div id="card-body customized-card">
                {<Datatable columns={columns} data={equipmentLogList} />}
              </div>
              <div align="center" >
                <button className="mt-2 btn add" onClick={() => addEquipmentLog()} >
                  ADD
                </button>
                <Link className="mt-2 btn back" to="/dashboard">BACK</Link>
              </div>
            </div>
          </div>
        </div >

      );
  };
}

export default EquipmentLog;