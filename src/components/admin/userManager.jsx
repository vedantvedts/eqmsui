import { useEffect, useState } from "react";
import { getUserManagerList } from "../../services/admin.service";
import Datatable from "../datatable/datatable";
import Navbar from "../navbar/navbar";

const UserManager = () =>{

  const [userManager, setUserManagerList] = useState([]);
  const [status, setStatus] = useState('');

const columns = [
  { name: "SN", selector: (row) => row.sn, sortable: true, align: 'text-center', width: '50px' },
  { name: "User Name", selector: (row) => row.userName, sortable: true, align: 'text-start', width: '50px' },
  { name: "Employee", selector: (row) => row.empName, sortable: true, align: 'text-start', width: '50px' },
  { name: "Role Name", selector: (row) => row.roleName, sortable: true, align: 'text-start', width: '50px' },
  { name: "Division", selector: (row) => row.division, sortable: true, align: 'text-start', width: '50px' },
  { name: "Action", selector: (row) => row.action, sortable: true, align: 'text-center', width: '50px' },
];

    const getManagerList = async () => {
        try {
          const data = await getUserManagerList(); 
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
        getManagerList();
      }, []);
      
      const setTableData = (data) => {
        setUserManagerList(
          data.map((item, index) => ({
            sn: index + 1 + '.',
            userName: item.userName ?? '-',
            empName: item.empName ?? '-',
            roleName: item.roleName ?? '-',
            division: item.division ?? '-',
            action: (
                // <button className="btn btn-warning btn-sm me-1" onClick={() => item.id != null && editMake(item.id)} title="Edit Make">
                //   <FaUserEdit  size={16}/>
                // </button>
                <></>
            ),
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
            <h3>User Manager List</h3>
            <div id="card-body customized-card">
              {<Datatable columns={columns} data={userManager} />}
            </div>
          </div>
        </div>
      </div>
      
    );
  };
}
export default UserManager;