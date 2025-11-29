import { Link } from "react-router-dom";
import Datatable from "../datatable/datatable";
import Navbar from "../navbar/navbar";
import { useEffect, useState } from "react";
import { getCalibrationMasterListById, getEquipmentListService } from "../../services/masterservice";
import Select from "react-select";
import CalibrationAddEditComponent from "./calibrationAddEditComponent";
import { FaEdit } from "react-icons/fa";
import { format } from "date-fns";

const Calibration = () => {


     const [calibrationList, setCalibrationList] = useState([]);
     const [calibrationId, setCalibrationId] = useState('');
     const [equipmentList, setEquipmentList] = useState([]);
      const [equipmentValue, setEquipmentValue] = useState('');
     const [equipmentName, setEquipmentName] = useState('');
      const [status, setStatus] = useState('');



        const editCalibration = async (id) => {
    setCalibrationId(id);
    setStatus('edit');
  }



      useEffect(() => {
         getEquipmentMasterList();
       }, []);

         const addCalibration = async () => {
            setStatus('add');
          }

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

 useEffect(() => {
    if (equipmentValue) {
      fetchCalibrationMasterListById(equipmentValue);
    }
  }, [equipmentValue]);

  useEffect(() => {
    if (equipmentList.length > 0 && (!equipmentValue || equipmentValue === "")) {
      setEquipmentValue(equipmentList[0].equipmentId);
      setEquipmentName(equipmentList[0].equipmentName);

    }
  }, [equipmentList]);

 const handleEquipChange = (data) => {
    setEquipmentValue(data?.value);
    setEquipmentName(data?.label);
  };

 const fetchCalibrationMasterListById = async (equipmentValue) => {
    try {
     
      
      const data = await getCalibrationMasterListById(equipmentValue);
      if (!data) return;
      if (Array.isArray(data) && data.length > 0) {
        setTableData(data);
      } else {
        setTableData([]);
      }

    } catch (err) {
      console.error("Failed to fetch calibration data:", err);
    }
  };


  const columns = [
    { name: "SN", selector: (row) => row.sn, sortable: true, align: 'text-center' },
  
    { name: "Calibration Start Date ", selector: (row) => row.calibrationDate, sortable: true, align: 'text-center' },
    { name: "Calibration Due Date", selector: (row) => row.calibrationDueDate, sortable: true, align: 'text-center' },
    { name: "Action", selector: (row) => row.action, sortable: true, align: 'text-center', },
  ];



  const setTableData = (data) => {

    const sortedData = [...data].sort(
    (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
  );

    setCalibrationList(
      sortedData.map((item, index) => ({
        sn: index + 1 + '.',
        equipmentName: item.equipmentName ?? '-',
        calibrationDate:item.calibrationDate ? format(new Date(item.calibrationDate), "dd-MM-yyyy"): '-',
        calibrationDueDate:item.calibrationDueDate ? format(new Date(item.calibrationDueDate),"dd-MM-yyyy"): '-',
       
        action: (
          <>
           {index === 0 && item.calibrationId && (
            <button className="btn btn-warning btn-sm" onClick={() => item.calibrationId != null && editCalibration(item.calibrationId)} title="Edit Equipment">
              <FaEdit size={16} />
            </button>

            )}
          </>
        ),
      }))
    );
  };



 switch (status) {
    case 'add':
      return <CalibrationAddEditComponent mode={'add'} equipmentValue={equipmentValue} equipmentName={equipmentName}></CalibrationAddEditComponent>;
    case 'edit':
      return <CalibrationAddEditComponent mode={'edit'} calibrationId={calibrationId} equipmentName={equipmentName} ></CalibrationAddEditComponent>;
    default:
    return(
        <div>
           
          <Navbar />
          <div className="card p-2">
            <div className="card-body text-center">
                <h3>Calibration</h3>
              
             
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
                </div>
              </div>


              <div id="card-body customized-card">
                {<Datatable columns={columns}  data={calibrationList} />}
              </div>
              <div align="center" >
                <button className="mt-2 btn add" onClick={() => addCalibration()}>
                  Revise
                </button>
                <Link className="mt-2 btn back" to="/dashboard">BACK</Link>
              </div>
            </div>
          </div>
        </div >

     );
   };

}

export default Calibration;