import { useEffect, useState } from "react";
import Datatable from "../datatable/datatable";
import { getEquipmentById, getEquipmentListService } from "../../services/masterservice";
import EquipmentAddEditComponent from "./equipmentAddEditComponent";
import "../datatable/master.css";
import { FaDownload, FaEdit } from "react-icons/fa";
import { Link } from "react-router-dom";
import Navbar from "../navbar/navbar";
import { printEquipmentDownload } from "../print/equipmentPrint";

const Equipment = () => {

  const [equipmentList, setEquipmentList] = useState([]);
  const [status, setStatus] = useState('');
  const [equipmentId, setEquipmentId] = useState('');

  const columns = [
    { name: "SN", selector: (row) => row.sn, sortable: true, align: 'text-center' },
    { name: "Equipment Name", selector: (row) => row.equipmentName, sortable: true, align: 'text-start' },
    { name: "Item Serial No", selector: (row) => row.itemSerialNumber, sortable: true, align: 'text-center' },
    { name: "Make", selector: (row) => row.make, sortable: true, align: 'text-start' },
    { name: "Model", selector: (row) => row.model, sortable: true, align: 'text-start' },
    { name: "Item Cost", selector: (row) => row.itemCost, sortable: true, align: 'text-end' },
    { name: "Location", selector: (row) => row.location, sortable: true, align: 'text-start', },
    { name: "SSRNo", selector: (row) => row.ssrNo, sortable: true, align: 'text-start' },
    { name: "Action", selector: (row) => row.action, sortable: true, align: 'text-center', },
  ];

  const editEquipment = async (id) => {
    setEquipmentId(id);
    setStatus('edit');
  }

  const handleEquipmentDownload = async (id) => {
    const data = await getEquipmentById(id);
    await printEquipmentDownload(data);
  }

  const addEquipment = () => {
    setStatus('add');
  }

  const getEquipmentMasterList = async () => {
    try {
      const data = await getEquipmentListService();
      if (Array.isArray(data) && data.length > 0) {
        setTableData(data);
      } else {
        setTableData([]);
      }
    } catch (err) {
      setTableData([]);
    }
  };

  useEffect(() => {
    getEquipmentMasterList();
  }, []);

  const setTableData = (data) => {
    setEquipmentList(
      data.map((item, index) => ({
        sn: index + 1 + '.',
        equipmentName: item.equipmentName ?? '-',
        itemSerialNumber: item.itemSerialNumber ?? '-',
        make: item.make ?? '-',
        model: item.model ?? '-',

        itemCost: item.itemCost ?? '-',
        location: item.location ?? '-',
        ssrNo: item.ssrNo ?? '-',
        action: (
          <>
            <button
              type="button"
              className="btn btn-sm btn-outline-success me-2"
              onClick={() => handleEquipmentDownload(item.equipmentId)}
            >
              &nbsp;
              <FaDownload size={16} />
            </button>
            <button className="btn btn-warning btn-sm" onClick={() => item.equipmentId != null && editEquipment(item.equipmentId)} title="Edit Equipment">
              <FaEdit size={16} />
            </button>
          </>
        ),
      }))
    );
  };

  switch (status) {
    case 'add':
      return <EquipmentAddEditComponent mode={'add'}></EquipmentAddEditComponent>;
    case 'edit':
      return <EquipmentAddEditComponent mode={'edit'} equipmentId={equipmentId}></EquipmentAddEditComponent>;
    default:
      return (
        <div>
          <Navbar />
          <div className="card p-2">
            <div className="card-body text-center">
              <h3>Equipment List</h3>
              <div id="card-body customized-card">
                {<Datatable columns={columns} data={equipmentList} />}
              </div>
              <div align="center" >
                <button className="mt-2 btn add" onClick={() => addEquipment()} >
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

export default Equipment;