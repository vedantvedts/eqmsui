import { useEffect, useState } from "react";
import { getFormDetailsList } from "../../services/admin.service";
import { getComponentIssuedListByComponent, getComponentList, saveComponentReturnedData } from "../../services/componentservices";
import "react-datepicker/dist/react-datepicker.css";
import * as Yup from "yup";
import Datatable from "../datatable/datatable";
import Navbar from "../navbar/navbar";
import { format, parseISO } from "date-fns";
import ComponentIssued from "./componentIssued";
import DatePicker from "react-datepicker";
import Select from "react-select";
import { getEmployeeListService } from "../../services/masterservice";
import { showAlert, showConfirmation } from "../datatable/swalHelper";
import { Form as RouterForm, Link } from "react-router-dom";
import { ErrorMessage, Field, Formik, Form } from "formik";
import { FaEdit, FaFileExcel, FaFilePdf } from "react-icons/fa";
import { downloadIssueItemsPDF } from "../../services/inventoryService";
import { generateExcelForListPage } from "../print/generateExcelForListPage";
import { Tooltip } from "react-tooltip";
const FORM_URL = "inventoryissue";

const selectStyles = {
    control: (base, state) => ({
        ...base,
        minHeight: 38,
        fontSize: 14,
        borderRadius: 6,
        borderColor: state.isFocused ? "#86b7fe" : "#ced4da",
        boxShadow: state.isFocused ? "0 0 0 0.2rem rgba(13,110,253,.25)" : "none",
        "&:hover": { borderColor: "#86b7fe" },
    }),
    option: (base, { isFocused, isSelected }) => ({
        ...base,
        fontSize: 14,
        background: isSelected ? "#0d6efd" : isFocused ? "#e8f0fe" : "#fff",
        color: isSelected ? "#fff" : "#212529",
    }),
    menuPortal: base => ({ ...base, zIndex: 9999 }),
};
const ReturnModal = ({ issuedRow, employeeOptions, onClose, onSaved, refreshList }) => {
    const username = localStorage.getItem("userName") ?? "system";

    const initialValues = {
        componentIssuedId: issuedRow?.componentIssuedId ?? "",
        returnedDate: new Date(),
        returnedBy: "",
        remarks: "",
    };

    const validationSchema = Yup.object().shape({
        returnedDate: Yup.date().nullable().required("Returned Date is required"),
        returnedBy: Yup.number().typeError("Returned By is required").required("Returned By is required"),
        remarks: Yup.string()
            .min(2, "Remarks must be at least 2 characters")
            .max(500, "Remarks must be at most 500 characters")
            .required("Remarks is required"),
    });

    const handleSubmit = async (values) => {
        try {
            const confirmed = await showConfirmation();
            if (!confirmed) return;

            const payload = {
                componentIssuedId: values.componentIssuedId,
                returnedDate: format(new Date(values.returnedDate), "yyyy-MM-dd"),
                returnedBy: values.returnedBy,
                remarks: values.remarks,
                createdBy: username,
            };

            const response = await saveComponentReturnedData(payload);

            if (response?.componentReturnedId > 0) {
                showAlert("Success", "Component returned successfully", "success");

                const returnedByEmp = employeeOptions.find(
                    o => String(o.value) === String(values.returnedBy)
                )?.label ?? values.returnedBy;

                onSaved(issuedRow.componentIssuedId, {
                    ...response,
                    returnedByEmp,
                });
                onClose();
                refreshList?.(); // Refresh the issue list to reflect the returned status
            } else {
                showAlert("Error", "Failed to save return. Please try again.", "error");
            }
        } catch (error) {
            console.error("Return submission error:", error);
            const msg = error?.response?.data?.message ?? "Something went wrong. Please try again later.";
            showAlert("Error", msg, "error");
        }
    };

    return (
        <div
            style={{
                position: "fixed", inset: 0, zIndex: 1050,
                background: "rgba(0,0,0,0.45)",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "1rem",
            }}
        >
            <div
                style={{
                    background: "#fff", borderRadius: 12,
                    width: "100%", maxWidth: 480,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        padding: "1rem 1.25rem",
                        background: "linear-gradient(120deg, #355cdd 0%, #1e3fa8 100%)",
                        borderRadius: "12px 12px 0 0",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        color: "#fff",
                    }}
                >
                    <div style={{ fontSize: 15, fontWeight: 700 }}>
                        <i className="ti ti-corner-up-left me-1" />
                        Return Component
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            border: "0.5px solid rgba(255,255,255,0.4)", borderRadius: 8,
                            width: 28, height: 28, cursor: "pointer",
                            background: "rgba(255,255,255,0.15)", color: "#fff",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Issue summary */}
                <div
                    className="text-start"
                    style={{
                        margin: "1rem 1.25rem 0",
                        padding: "10px 14px",
                        background: "#FAFBFF",
                        border: "1px solid #F1F4F9",
                        borderRadius: 8,
                        fontSize: 13,
                    }}
                >
                    <div style={{ color: "#6B7280" }}>
                        Issued Qty: <strong style={{ color: "#111827" }}>{issuedRow?.qty}</strong>{" "}
                        on <strong style={{ color: "#111827" }}>
                            {issuedRow?.issuedDate ? format(parseISO(issuedRow.issuedDate), "dd-MM-yyyy") : "—"}
                        </strong>
                    </div>
                    <div style={{ color: "#6B7280", marginTop: 2 }}>
                        Issued To: <strong style={{ color: "#111827" }}>{issuedRow?.issuedToEmp ?? issuedRow?.issuedTo}</strong>
                    </div>
                </div>

                {/* Form */}
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ values, setFieldValue, errors, touched }) => (
                        <Form>
                            <div className="text-start" style={{ padding: "1rem 1.25rem 0" }}>

                                {/* Returned Date */}
                                <div className="form-group mb-3">
                                    <label className="d-block">
                                        Returned Date: <span className="text-danger">*</span>
                                    </label>
                                    <DatePicker
                                        selected={values.returnedDate}
                                        onChange={date => setFieldValue("returnedDate", date)}
                                        dateFormat="dd-MM-yyyy"
                                        placeholderText="DD-MM-YYYY"
                                        className="form-control"
                                        minDate={issuedRow?.issuedDate ? parseISO(issuedRow.issuedDate) : null}
                                        maxDate={new Date()}
                                        showMonthDropdown
                                        showYearDropdown
                                        dropdownMode="select"
                                        autoComplete="off"
                                    />
                                    {touched.returnedDate && errors.returnedDate && (
                                        <div className="text-danger" style={{ fontSize: 13, marginTop: 4 }}>
                                            {errors.returnedDate}
                                        </div>
                                    )}
                                </div>

                                {/* Returned By */}
                                <div className="form-group mb-3">
                                    <label className="d-block">
                                        Returned By: <span className="text-danger">*</span>
                                    </label>
                                    <Select
                                        options={employeeOptions}
                                        value={employeeOptions.find(o => String(o.value) === String(values.returnedBy)) ?? null}
                                        onChange={opt => setFieldValue("returnedBy", opt?.value ?? "")}
                                        placeholder="Select Employee"
                                        isClearable
                                        styles={selectStyles}
                                        menuPortalTarget={document.body}
                                        classNamePrefix="react-select"
                                    />
                                    {touched.returnedBy && errors.returnedBy && (
                                        <div className="text-danger" style={{ fontSize: 13, marginTop: 4 }}>
                                            {errors.returnedBy}
                                        </div>
                                    )}
                                </div>

                                {/* Remarks */}
                                <div className="form-group mb-3">
                                    <label className="d-block">
                                        Remarks: <span className="text-danger">*</span>
                                    </label>
                                    <Field
                                        as="textarea"
                                        name="remarks"
                                        rows={3}
                                        className="form-control"
                                        placeholder="Enter remarks about the return"
                                    />
                                    <ErrorMessage name="remarks" component="div" className="text-danger" />
                                </div>

                            </div>

                            <div
                                align="center"
                                style={{
                                    padding: "0.85rem 1.25rem 1.25rem",
                                    display: "flex", justifyContent: "center", gap: 10,
                                }}
                            >
                                <button type="submit" className="btn submit">SUBMIT</button>
                                <button type="button" className="btn back" onClick={onClose}>CANCEL</button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};
const InventoryIssue = () => {

    const [issueList, setIssueList] = useState([]);
    const [returnedMap, setReturnedMap] = useState({});
    const [status, setStatus] = useState('');
    const [issueId, setIssueId] = useState(null);
    const [issueType, setIssueType] = useState('A');
    const [returnModalRow, setReturnModalRow] = useState(null);
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [rowData, setRowData] = useState(null);


    // New Year's Day of Next Year (e.g., 2027-01-01)
    const getNewYearDate = () => {
        const nextYear = new Date().getFullYear();
        return `${nextYear}-01-01`;
    };

    // Current Local Date Today (YYYY-MM-DD)
    const getCurrentDate = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    // State Hooks
    const [fromDateValue, setFromDateValue] = useState(getNewYearDate());
    const [toDateValue, setToDateValue] = useState(getCurrentDate());;
    const [permissions, setPermissions] = useState({
        forView: false, forAdd: false, forEdit: false, forDelete: false,
    });

    const addIssue = () => {
        setStatus('add');
    };

    const editIssue = (rowData) => {
        setStatus('edit');
        setRowData(rowData);
    }

    useEffect(() => {
        const roleId = localStorage.getItem("roleId");
        const loadPermissions = async () => {
            try {
                const details = await getFormDetailsList(roleId);
                const detailArray = Array.isArray(details) ? details : details?.data ?? [];
                const match = detailArray.find((d) => d.formUrl?.toLowerCase() === FORM_URL.toLowerCase());
                if (match) {
                    setPermissions({
                        forView: match.forView === true || match.forView === 1 || match.forView === "Y",
                        forAdd: match.forAdd === true || match.forAdd === 1 || match.forAdd === "Y",
                        forEdit: match.forEdit === true || match.forEdit === 1 || match.forEdit === "Y",
                        forDelete: match.forDelete === true || match.forDelete === 1 || match.forDelete === "Y",
                    });
                }
            } catch (err) {
                console.error("Failed to load permissions", err);
            }
        };
        loadPermissions();
    }, []);

    useEffect(() => {
        if (permissions.forView) getIssueData(fromDateValue, toDateValue);
    }, [permissions.forView, fromDateValue, toDateValue, issueType]);

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = async () => {
        try {
            const employees = await getEmployeeListService();
            const eArr = Array.isArray(employees) ? employees : employees?.data ?? [];
            setEmployeeOptions(
                eArr.map(e => ({
                    value: e.empId ?? e.id,
                    label: e.displayName ?? `${e.firstName ?? ""} ${e.lastName ?? ""}`.trim(),
                }))
            );
        } catch (err) {
            console.error("Failed to load employees:", err);
        }
    };

    const baseColumns = [
        { name: "SN", selector: (row) => row.sn, sortable: true, align: 'text-center' },
        { name: "Item Name", selector: (row) => row.itemName, sortable: true, align: 'text-start' },
        { name: "Issued Date", selector: (row) => row.issuedDate, sortable: true, align: 'text-center' },
        { name: "Issued By", selector: (row) => row.issuedBy, sortable: true, align: 'text-start' },
        { name: "Qty", selector: (row) => row.qty, sortable: true, align: 'text-center' },
        { name: "Issued To Division", selector: (row) => row.divisionName, sortable: true, align: 'text-start' },
        { name: "Issued To", selector: (row) => row.issuedTo, sortable: true, align: 'text-start' },
        { name: "Purpose", selector: (row) => row.purpose, sortable: true, align: 'text-start' },
        ...(issueType === "A" ? [{
            name: "Issue Type",
            selector: (row) => row.issueType,
            sortable: true,
            align: 'text-center'
        }] : []),
        { name: "Probable Return Date", selector: (row) => row.probableDateOfReturn, sortable: true, align: 'text-center' },
        { name: "Return Info", selector: (row) => row.remarks, sortable: true, align: 'text-start', excelExclude: true, },

    ];

    const columns = (permissions.forEdit || permissions.forAdd)
        ? [...baseColumns, { name: "Action", selector: (row) => row.action, align: 'text-center', width: "150px", excelExclude: true }]
        : baseColumns;

    const getIssueData = async () => {
        try {
            const fromdate = format(new Date(fromDateValue), "yyyy-MM-dd");
            const todate = format(new Date(toDateValue), "yyyy-MM-dd");
            const data = await getComponentIssuedListByComponent(fromdate, todate, issueType);
            const arr = Array.isArray(data) ? data : data?.data ?? [];

            const seeded = {};
            arr.forEach(row => {
                const ret = row.componentReturned;
                if (ret || row.returnedDate) {
                    seeded[row.componentIssuedId] = {
                        returnedDate: ret?.returnedDate ?? row.returnedDate,
                        returnedByEmp: ret?.returnedByEmp ?? row.returnedByEmp,
                        remarks: ret?.remarks ?? row.returnedRemarks,
                    };
                }
            });

            setReturnedMap(seeded);
            setTableData(arr, seeded);   // pass it explicitly
        } catch (err) {
            console.error("Failed to fetch component data:", err);
            setIssueList([]);
            setReturnedMap({});
        }
    };

    const setTableData = (data, returnedData) => {
        const map = returnedData ?? returnedMap;   // fall back when called without it

        setIssueList(
            (data || []).map((item, index) => {
                const returned = map[item.componentIssuedId];
                const isReturnable = item.issueType === "R";

                // Helper function to safely format dates
                const formatDate = (dateVal) => {
                    if (!dateVal) return "-";
                    const parsed = typeof dateVal === "string" ? parseISO(dateVal) : dateVal;
                    return format(parsed, "dd-MM-yyyy");
                };

                return {
                    sn: `${index + 1}.`,
                    componentId: item.componentId,
                    itemName: item.itemName ?? "-",
                    divisionName: item.divisionName ?? "-",
                    issuedDate: formatDate(item.issuedDate),
                    issuedBy: item.issuedByEmp ?? "-",
                    issuedTo: item.issuedToEmp ?? "-",
                    qty: item.qty ?? "-",
                    purpose: item.purpose ?? "-",
                    issueType: isReturnable ? "Returnable" : "Non-Returnable",
                    probableDateOfReturn: isReturnable
                        ? formatDate(item.probableDateOfReturn)
                        : "-",
                    remarks: !isReturnable ? (
                        <span className="text-bold">-</span>
                    ) : returned ? (
                        <div style={{ fontSize: 12 }}>
                            <div>
                                <strong>Returned:</strong> {formatDate(returned.returnedDate)}
                            </div>
                            <div>
                                <strong>By:</strong> {returned.returnedByEmp ?? "—"}
                            </div>
                            {returned.remarks && (
                                <div className="text-muted" style={{ fontSize: 11 }}>
                                    {returned.remarks}
                                </div>
                            )}
                        </div>
                    ) : (
                        <span
                            style={{
                                fontSize: 11,
                                fontWeight: 700,
                                padding: "2px 8px",
                                borderRadius: 12,
                                background: "rgba(226,75,74,0.10)",
                                color: "#991B1B",
                            }}
                        >
                            Not Returned
                        </span>
                    ),
                    // Excel value
                    returnInfo: !isReturnable
                        ? "-"
                        : returned
                            ? [
                                `Returned: ${formatDate(returned.returnedDate)} `,
                                `By: ${returned.returnedByEmp ?? "-"} `,
                                returned.remarks
                                    ? `Remarks: ${returned.remarks}`
                                    : null,
                            ]
                                .filter(Boolean)
                                .join("\n")
                            : "Not Returned",
                    action: (
                        <div>
                            {permissions?.forEdit ? (
                                <>

                                    <button className="btn btn-warning btn-sm me-2"
                                        data-tooltip-id="Tooltip"
                                        data-tooltip-content="Edit"
                                        data-tooltip-place="top"
                                        onClick={() => item.componentIssuedId != null && editIssue(item)} title="Edit">
                                        <FaEdit size={16} />
                                    </button>

                                    {isReturnable && !returned && (
                                        <button
                                            type="button"
                                            className="btn btn-sm"
                                            style={{
                                                background: "#355cdd",
                                                color: "#fff",
                                                border: "none",
                                                borderRadius: 6,
                                                padding: "4px 12px",
                                                fontSize: 12,
                                                fontWeight: 600,
                                            }}
                                            onClick={() => setReturnModalRow(item)}
                                        >
                                            Return
                                        </button>
                                    )}

                                    {isReturnable && returned && (
                                        <span
                                            style={{
                                                fontSize: 11,
                                                fontWeight: 700,
                                                padding: "2px 8px",
                                                borderRadius: 12,
                                                background: "rgba(16,185,129,0.13)",
                                                color: "#065F46",
                                            }}
                                        >
                                            Returned
                                        </span>
                                    )}

                                    <Tooltip id="Tooltip" className='text-white tooltipName' />


                                </>
                            ) : (
                                <span className="text-muted"></span>
                            )}
                        </div>
                    ),
                };
            })
        );
    };

    const issueTypeOptions = [
        { value: "A", label: "All" },
        { value: "R", label: "Returnable" },
        { value: "N", label: "Non-Returnable" },
        { value: "NR", label: "Pending Return" }
    ];

    const handleReturnSaved = (componentIssuedId, returnedData) => {
        setReturnedMap(prev => ({
            ...prev,
            [componentIssuedId]: {
                returnedDate: returnedData.returnedDate,
                returnedByEmp: returnedData.returnedByEmp,
                remarks: returnedData.remarks,
            },
        }));
    };

    const handlePdfExport = async () => {
        const payLoad = {
            issueType: issueType,
            fromDate: format(new Date(fromDateValue), "yyyy-MM-dd"),
            toDate: format(new Date(toDateValue), "yyyy-MM-dd"),
        };
        await downloadIssueItemsPDF(payLoad);
    }

    const handleExcelExport = () => {
        generateExcelForListPage({
            title: "Inventory Issue Items Report",
            columns: [
                ...columns,
                {
                    name: "Return Info",
                    selector: (row) => row.returnInfo ?? "-",
                    sortable: true,
                    align: "text-start",
                },
            ],
            data: issueList,
            fileName: "Inventory_Issue_Items_Report",

            details: {
                "Issue Type": issueTypeOptions.find(
                    opt => opt.value === issueType
                )?.label || "-",
                "From Date": format(new Date(fromDateValue), "dd-MM-yyyy"),
                "To Date": format(new Date(toDateValue), "dd-MM-yyyy"),
            }
        });
    };

    switch (status) {
        case 'add':
            return <ComponentIssued
                status={status}
                rowData={null}
                setStatus={setStatus}
                refreshList={getIssueData}
            />;
        case 'edit':
            return <ComponentIssued
                status={status}
                rowData={rowData}
                setStatus={setStatus}
                refreshList={getIssueData}
            />;

        default:
            return (<>
                <div>
                    <Navbar />
                    <div className="card p-2">
                        <div className="card-body text-center">
                            <h3>Inventory Issue List</h3>

                            <div className="row justify-content-center align-items-center rowHeadercolor mb-2">
                                <div className="col-md-12 d-flex justify-content-end align-items-center flex-wrap">
                                    <div className="d-flex align-items-center me-4 mb-2">
                                        <label className="font-label me-3 mb-0">
                                            Issue Type:
                                        </label>

                                        <div className="d-flex align-items-center gap-3 mt-1">
                                            {issueTypeOptions.map((option) => (
                                                <div className="form-check" key={option.value}>
                                                    <input
                                                        className="form-check-input"
                                                        type="radio"
                                                        name="issueType"
                                                        id={`issueType-${option.value}`}
                                                        value={option.value}
                                                        checked={issueType === option.value}
                                                        onChange={(e) => setIssueType(e.target.value)}
                                                    />

                                                    <label
                                                        className="form-check-label"
                                                        htmlFor={`issueType-${option.value}`}
                                                    >
                                                        {option.label}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="d-flex align-items-center me-4 mb-2">
                                        <label htmlFor="fromDate" className="font-label me-2 mb-0">From:</label>
                                        <DatePicker
                                            selected={fromDateValue}
                                            onChange={(newValue) => setFromDateValue(newValue)}
                                            className="form-control"
                                            placeholderText="Select From Date"
                                            dateFormat="dd-MM-yyyy"
                                            showYearDropdown
                                            showMonthDropdown
                                            dropdownMode="select"
                                            onKeyDown={(e) => e.preventDefault()}
                                        />
                                    </div>

                                    <div className="d-flex align-items-center me-4 mb-2">
                                        <label htmlFor="toDate" className="font-label me-2 mb-0">To:</label>
                                        <DatePicker
                                            selected={toDateValue}
                                            onChange={(newValue) => setToDateValue(newValue)}
                                            className="form-control"
                                            placeholderText="Select To Date"
                                            dateFormat="dd-MM-yyyy"
                                            showYearDropdown
                                            showMonthDropdown
                                            dropdownMode="select"
                                            // minDate={getMinDate()}
                                            onKeyDown={(e) => e.preventDefault()}
                                        />
                                    </div>
                                    <div className="ms-2 mb-2">
                                        <button type="button" className="btn btn-danger me-2" onClick={() => handlePdfExport()}>
                                            <FaFilePdf size={18} />
                                        </button>

                                        <button type="button" className="btn btn-success" onClick={() => handleExcelExport()}>
                                            <FaFileExcel size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div id="card-body customized-card">
                                <Datatable columns={columns} data={issueList} />
                            </div>
                            <div align="center">
                                {permissions.forAdd && (
                                    <button className="mt-2 btn add me-2" onClick={() => addIssue()} >ADD</button>
                                )}
                                <Link className="mt-2 btn back" to="/dashboard">BACK</Link>
                            </div>
                        </div>
                    </div>
                </div>
                {/* ── Return Modal ── */}
                {returnModalRow && (
                    <ReturnModal
                        issuedRow={returnModalRow}
                        employeeOptions={employeeOptions}
                        onClose={() => setReturnModalRow(null)}
                        onSaved={handleReturnSaved}
                        refreshList={getIssueData}
                    />
                )}
            </>
            )
    }
}

export default InventoryIssue;