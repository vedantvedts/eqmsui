import { useEffect, useState } from "react";
import Calibration from "./calibration";
import Navbar from "../navbar/navbar";
import DatePicker from "react-datepicker";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { format } from "date-fns";
import { showAlert, showConfirmation } from "../datatable/swalHelper";

import * as Yup from "yup";
import { getCalibrationId, saveCalibrationData, UpdateCalibration } from "../../services/masterservice";

const CalibrationAddEditComponent=({mode,calibrationId,equipmentValue,equipmentName})=>{


  const [status, setStatus] = useState('');


    const [formData, setFormData] = useState({
    equipmentId: equipmentValue || "",
    
    calibrationDate: "",
    calibrationDueDate: "",
  });

  const getDataByCalibrationId = async (calibrationId) => {
    try {
      const data = await getCalibrationId(calibrationId);
      if (!data) return;

      setFormData(prev => ({
        ...prev,
        calibrationId: data?.calibrationId ?? "",
        equipmentId: data?.equipmentId ?? "",
       
        calibrationDate: data?.calibrationDate ?? "",
        calibrationDueDate: data?.calibrationDueDate ?? "",
     
      }));
    } catch (err) {
      console.error("Failed to fetch equipment data:", err);
    }
  };

  useEffect(() => {
    if (calibrationId) {
      getDataByCalibrationId(calibrationId);
    }
    
  }, [calibrationId]);


  // Form Validation Schema


  const requiredField = Yup.string().required("This field is required");

  const validationSchema = Yup.object().shape({

    calibrationDate: requiredField,
    calibrationDueDate: requiredField,
   

  });


const handleSubmit = async (values) => {

    const dto = {
      ...values,
      calibrationDate: values.calibrationDate ? format(new Date(values.calibrationDate), "yyyy-MM-dd") : null,
      calibrationDueDate: values.calibrationDueDate ? format(new Date(values.calibrationDueDate), "yyyy-MM-dd") : null,
     

    }

   

    try {
      if (mode === "add") {
        const confirmed = await showConfirmation();
        if (confirmed) {
          const response = await saveCalibrationData(dto);
          if (response.calibrationId != null && response.calibrationId > 0) {
            setStatus('list');
            showAlert("Success", "Calibration added successfully", "success");
          }
          else {
            showAlert("Error", "Failed to add equipment. Please try again.", "error");
          }
        }
      } else {
        const confirmed = await showConfirmation();
        if (confirmed) {
          const response = await UpdateCalibration(calibrationId, dto);
          if (response.calibrationId != null && response.calibrationId > 0) {
            setStatus('list');
            showAlert("Success", "Calibration updated successfully", "success");
          }
          else {
            showAlert("Error", "Failed to update equipment. Please try again.", "error");
          }
        }
      }
    } catch (error) {
      console.error("Submission error:", error);
      showAlert("Error", "Something went wrong. Please try again later.", "error");
    }
  };



    const redirectCalibrationList = () => {
    setStatus('list');
  }

    const getMinDate = () => {
    const currentDate = new Date();
    const minYear = currentDate.getFullYear() - 20;
    return new Date(minYear, currentDate.getMonth(), currentDate.getDate());
  };

  const getMaxDate = () => {
    const currentDate = new Date();
    const maxYear = currentDate.getFullYear() + 50;
    return new Date(maxYear, currentDate.getMonth(), currentDate.getDate());
  };



  switch (status) {
    case 'list':
      return <Calibration></Calibration>;
    default:
      return (
        <div>
          <Navbar />
          <div className="expert-form-container">
            <div className="form-card" style={{ marginLeft: "25%", marginRight: "25%" }}>
              <h4 className="form-title">{mode === "add" ? "Revise Calibration" : "Edit Calibration"} - {equipmentName}</h4>
              <Formik
                initialValues={formData}
                validationSchema={validationSchema}
                onSubmit={(values) => {
                  // const payload = {
                  //   ...values,
                  //   model: values.model ? { id: values.model } : null,
                  //   make: values.make ? { id: values.make } : null,
                  // };
                  handleSubmit(values);
                }}

                enableReinitialize={true}
              >
                {({ setFieldValue, setFieldTouched, values }) => (
                  <Form>
                    <div className="column" align="center">
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="calibrationDate" className="text-start d-block">
                            Calibration Date :
                          </label>

                          <DatePicker
                            selected={values.calibrationDate}
                            onChange={(date) => {
                              setFieldValue("calibrationDate", date);
                              if (date) {
                                const dueDate = new Date(date);
                                dueDate.setFullYear(dueDate.getFullYear() + 1);
                                setFieldValue("calibrationDueDate", dueDate);
                              }
                            }}
                            className="form-control mb-2"
                            placeholderText="Select Calibration Date"
                            dateFormat="dd-MM-yyyy"
                            showYearDropdown
                            showMonthDropdown
                            dropdownMode="select"
                            minDate={getMinDate()}
                            maxDate={getMaxDate()}
                            onKeyDown={(e) => e.preventDefault()}
                          />

                          <ErrorMessage name="calibrationDate" component="div" className="text-danger text-start" />
                        </div>
                      </div>

                       <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="calibrationDueDate" className="text-start d-block">
                            Calibration Due Date :
                          </label>

                          <DatePicker
                            selected={values.calibrationDueDate}
                            onChange={(date) => setFieldValue("calibrationDueDate", date)}
                            className="form-control mb-2"
                            placeholderText="Select Calibration Due Date"
                            dateFormat="dd-MM-yyyy"
                            showYearDropdown
                            showMonthDropdown
                            dropdownMode="select"
                            minDate={values.calibrationDate || getMinDate()}
                            maxDate={getMaxDate()}
                            onKeyDown={(e) => e.preventDefault()}
                          />

                          <ErrorMessage name="calibrationDueDate" component="div" className="text-danger text-start" />
                        </div>
                      </div> 
                    </div>

                    <div align="center">
                      <button type="submit" className={`btn ${mode === "add" ? "submit" : "edit"} mt-3`} >
                        {mode === "add" ? "SUBMIT" : "UPDATE"}
                      </button>
                      <button className="btn back mt-3" onClick={() => redirectCalibrationList()}>BACK</button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      );
  }


};


export default CalibrationAddEditComponent;
