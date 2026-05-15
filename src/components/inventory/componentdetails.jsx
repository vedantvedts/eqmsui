import { FaEdit } from "react-icons/fa";
import Navbar from "../navbar/navbar";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { getComponentList, getComponentMasterListById } from "../../services/componentservices";
import Select from "react-select";
import Datatable from "../datatable/datatable";
import ComponentDetailsAddEditComponent from "./componentdetailsaddedit";



const ComponentDetails = ({ selectedComponentId, selectedComponentName }) => {


const [ComponentDetailsList, setComponentDetailsList] = useState([]);
const [status, setStatus] = useState('');
const [ComponentList,setComponentList]=useState([]);
const [componentValue, setComponentValue] = useState(selectedComponentId || '');
const [componentName, setComponentName] = useState(selectedComponentName || '');
const [componentDetailsId, setComponentDetailsId] = useState('');



        useEffect(() => {
         getComponentMasterList();
       }, []);

        const addComponentDetails = async () => {
            setStatus('add');
          }


  const editComponentDetails = async (id) => {
    setComponentDetailsId(id);
    setStatus('edit');
  }

  const getComponentMasterList = async () => {
      try {
        const data = await getComponentList();
        if (Array.isArray(data) && data.length > 0) {
          setComponentList(data);
        } else {
          setComponentList([]);
          console.error("Component list is empty or invalid.");
        }
      } catch (error) {
        console.error("Error fetching component list:", error);
        setComponentList([]);
      }
    };

const componentOptions = ComponentList.map(comp => ({
    value: comp.componentId,
    label: comp.componentName
  }));

useEffect(() => {
    if (componentValue) {
      fetchComponentMasterListById(componentValue);
    }
  }, [componentValue]);

  useEffect(() => {
  if (
    ComponentList.length > 0 &&
    (componentValue === "" || componentValue == null)
  ) {
    setComponentValue(
      selectedComponentId || ComponentList[0].componentId
    );

    setComponentName(
      selectedComponentName || ComponentList[0].componentName
    );
  }
}, [ComponentList, selectedComponentId, selectedComponentName]);

 const handleCompChange = (data) => {
    setComponentValue(data?.value);
    setComponentName(data?.label);
  };

 const fetchComponentMasterListById = async (componentValue) => {
     try {
      
       
       const data = await getComponentMasterListById(componentValue);
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
    { name: "Nomenclature", selector: (row) => row.componentNomenclature, sortable: true, align: 'text-center' },
    { name: "Part No", selector: (row) => row.partNo, sortable: true, align: 'text-center' },
    { name: "Qty ", selector: (row) => row.qty, sortable: true, align: 'text-center' },
    { name: "Action", selector: (row) => row.action, sortable: true, align: 'text-center', },
  ];





    const setTableData = (data) => {
      setComponentDetailsList( 
        data.map((item, index) => ({
          sn: index + 1 + '.',
          componentNomenclature: item.componentNomenclature ?? '-',
          partNo: item.partNo ?? '-',
          qty: item.qty ?? '-',
          action: (
            <>
             <button className="btn btn-warning btn-sm" title="Edit Equipment"  onClick={() => item.componentDetailsId != null && editComponentDetails(item.componentDetailsId)}>
                <FaEdit size={16} />
              </button>
            </>
          ),
        }))
      );
    };
  
    switch (status) {
    case 'add':
      return <ComponentDetailsAddEditComponent mode={'add'} componentValue={componentValue} componentName={componentName}></ComponentDetailsAddEditComponent>;
    case 'edit':
      return <ComponentDetailsAddEditComponent mode={'edit'} componentDetailsId={componentDetailsId} componentName={componentName} ></ComponentDetailsAddEditComponent>;
    default:
 return(
        <div>
           
          <Navbar />
          <div className="card p-2">
            <div className="card-body text-center">
                <h3>Component Details</h3>

                 <div className="row justify-ontent-center align-items-center rowHeadercolor">
                    <div className="col-md-12 d-flex justify-content-end  align-items-center flex wrap">
                      <div className="d-flex align-items-center me-4 mb-2">
                          <label htmlFor="equipmentId" className="font-label me-2 mb-0"> Component: &nbsp;</label>
                          <div className="text-start " style={{width:"400px"}}>
                          <Select
                            options={componentOptions}
                            value={componentOptions.find(opt => opt.value === Number(componentValue)) || null}
                            onChange={(data) => handleCompChange(data)}

                        /> 
                          </div>
                      </div>
                    </div>
                  </div>
 
              <div id="card-body customized-card">
                {<Datatable columns={columns}  data={ComponentDetailsList} />}
              </div>
              <div align="center" >
                <button className="mt-2 btn add"   onClick={() => addComponentDetails()} >
                  ADD
                </button>
                <Link className="mt-2 btn back" to="/dashboard">BACK</Link>
              </div>
            </div>
          </div>
        </div>

        
    );

  };
}
export default ComponentDetails;