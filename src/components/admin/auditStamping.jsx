import { useEffect, useState } from "react";
import { getAuditStampingList } from "../../services/admin.service";
import Datatable from "../datatable/datatable";
import Navbar from "../navbar/navbar";

const AuditStamping = () => {
 const [auditStamping, setAuditStamping] = useState([]);
  const [status, setStatus] = useState('');

const columns = [
  { name: "SN", selector: (row) => row.sn, sortable: true, align: 'text-center', width: '50px' },
  { name: "Login Date", selector: (row) => row.loginDate, sortable: true, align: 'text-start', width: '50px' },
  { name: "Login Time", selector: (row) => row.loginTime, sortable: true, align: 'text-start', width: '50px' },
  { name: "IP Address", selector: (row) => row.ipAddress, sortable: true, align: 'text-start', width: '50px' },
  { name: "Mac Address", selector: (row) => row.macAddress, sortable: true, align: 'text-start', width: '50px' },
  { name: "Logout type", selector: (row) => row.logoutType, sortable: true, align: 'text-start', width: '50px' },
  { name: "Logout Date Time", selector: (row) => row.logoutDateTime, sortable: true, align: 'text-center', width: '50px' },
];

    const getAuditStampingData = async () => {
        try {
          const data = await getAuditStampingList(); 
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
        getAuditStampingData();
      }, []);
      
      const setTableData = (data) => {
        setAuditStamping(
          data.map((item, index) => ({
            sn: index + 1 + '.',
            loginDate: item.loginDate ?? '-',
            loginTime: item.loginTime ?? '-',
            ipAddress: item.ipAddress ?? '-',
            macAddress: item.macAddress ?? '-',
            logoutType: item.logoutType ?? '-',
            logoutDateTime: item.logoutDateTime ?? '-',
          }))
        );
      };

  switch (status) {
    default:
    return (
      <div>
        <Navbar />
        <div className="card p-2">
          <div className="card-body text-center">
            <h3>Audit Stamping List</h3>
            <div id="card-body customized-card">
              {<Datatable columns={columns} data={auditStamping} />}
            </div>
          </div>
        </div>
      </div>
      
    );
  };
}

export default AuditStamping;