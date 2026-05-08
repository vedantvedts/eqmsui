import { Link } from "react-router-dom";

import Navbar from "../navbar/navbar";
import Datatable from "../datatable/datatable";
import { useState,useEffect } from "react";
import ComponentAddEdit from "./componentaddedit"
import { FaEdit } from "react-icons/fa";
import { getComponentList } from "../../services/componentservices";




const ComponentList = () => {


  const [componentList, setComponentList] = useState([]);
  const [status, setStatus] = useState('');
   const [componentId, setComponentId] = useState('');
     

 const addComponent = async () => {
      setStatus('add');
    }

     const editComponent = async (id) => {
    setComponentId(id);
    setStatus('edit');
  }


 useEffect(() => {
    
      getComponentData();
    
  }, []);

  const columns = [
    { name: "SN", selector: (row) => row.sn, sortable: true, align: 'text-center' },
    { name: "Component", selector: (row) => row.componentName, sortable: true, align: 'text-center' },
    { name: "Nomenclature ", selector: (row) => row.nomenclature, sortable: true, align: 'text-center' },
    { name: "Action", selector: (row) => row.action, sortable: true, align: 'text-center', },
  ];


   const getComponentData = async () => {
      try {
       
        
        const data = await getComponentList();
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


  const setTableData = (data) => {
     setComponentList(
       data.map((item, index) => ({
         sn: index + 1 + '.',
         componentName:item.componentName ?? '-',
         nomenclature:item.nomenclature ?? '-',
         action: (
           <>
             <button className="btn btn-warning btn-sm" onClick={() => item.componentId != null && editComponent(item.componentId)} title="Edit Equipment">
                          <FaEdit size={16} />
                        </button>
            </>
         ),
       }))
     );
   };


   switch (status) {
    case 'add':
      return <ComponentAddEdit mode={'add'} ></ComponentAddEdit>;
    case 'edit':
      return <ComponentAddEdit mode={'edit'} componentId={componentId} ></ComponentAddEdit>;
    default:
    return(
        <div>
           
          <Navbar />
          <div className="card p-2">
            <div className="card-body text-center">
                <h3>Component</h3>
              
              <div id="card-body customized-card">
               {<Datatable columns={columns}  data={componentList} />}
              </div>
              <div align="center" >
                <button className="mt-2 btn add" onClick={() => addComponent()}>
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

export default ComponentList;