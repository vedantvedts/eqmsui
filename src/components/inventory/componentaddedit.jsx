import { useState,useEffect } from "react";
import ComponentList from "./componentlist"
import Navbar from "../navbar/navbar";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { showAlert, showConfirmation } from "../datatable/swalHelper";
import * as Yup from "yup";
import { getComponentId, saveComponentData, UpdateComponentData } from "../../services/componentservices";



const ComponentAddEdit=({mode,componentId})=>{

  const [status, setStatus] = useState('');

  const [formData, setFormData] = useState({
    
    componentId:"",
    componentName: "",
    nomenclature: "",
    
  });

    const redirectComponentList = () => {
    setStatus('list');
  }



  const getDataByComponentId = async (componentId) => {
      try {
        const data = await getComponentId(componentId);
        if (!data) return;
  
        setFormData(prev => ({
          ...prev,
          componentId: data?.componentId ?? "",
          componentName: data?.componentName ?? "",
          nomenclature: data?.nomenclature ?? "",
         
       
        }));
      } catch (err) {
        console.error("Failed to fetch equipment data:", err);
      }
    };
  
    useEffect(() => {
      if (componentId) {
        getDataByComponentId(componentId);
      }
      
    }, [componentId]);


     const stringWithCommonRules = (label) =>
        Yup.string()
          .min(2, `${label} must be at least 2 characters`)
          .max(200, `${label} must be at most 255 characters`)
          .required(`${label} is required`);

   //const requiredField = Yup.string().required("This field is required");
  
    const validationSchema = Yup.object().shape({
  

      componentName:stringWithCommonRules("Component Name"),
      nomenclature:stringWithCommonRules("Nomenclature") 
     
     
  
    });

const handleSubmit = async (values) => {

    const dto = {
      ...values,
    }
   try {
      if (mode === "add") {
        const confirmed = await showConfirmation();
        if (confirmed) {
          const response = await saveComponentData(dto);
          if (response.componentId != null && response.componentId > 0) {
            setStatus('list');
            showAlert("Success", "Component added successfully", "success");
          }
          else {
            showAlert("Error", "Failed to add Component. Please try again.", "error");
          }
        }
      } else {
        const confirmed = await showConfirmation();
        if (confirmed) {
          const response = await UpdateComponentData(componentId, dto);
          if (response.componentId != null && response.componentId > 0) {
            setStatus('list');
            showAlert("Success", "Component updated successfully", "success");
          }
          else {
            showAlert("Error", "Failed to update Component. Please try again.", "error");
          }
        }
      }
    } catch (error) {
      console.error("Submission error:", error);
      showAlert("Error", "Something went wrong. Please try again later.", "error");
    }
  };





switch (status) {
    case 'list':
      return <ComponentList></ComponentList>;
    default:
      return (
        <div>
          <Navbar />
          <div className="expert-form-container">
            <div className="form-card" style={{ marginLeft: "25%", marginRight: "25%" }}>
              <h4 className="form-title">{mode === "add" ? "Add Component" : "Edit Component"} </h4>
              <Formik
                initialValues={formData}
                validationSchema={validationSchema}
                onSubmit={(values) => {
                  
                  handleSubmit(values);
                }}

                enableReinitialize={true}
              >
                {({ setFieldValue, setFieldTouched, values }) => (
                  <Form>
                    <div className="column" align="center">
                       <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="componentName" className="text-start d-block">Component : </label>
                          <Field
                            type="text"
                            name="componentName"
                            className="form-control mb-2"
                            placeholder="Enter Component Name"
                          />
                          <ErrorMessage name="componentName" component="div" className="text-danger text-start" />
                        </div>
                      </div> 
                   </div>

                    <div className="column" align="center">
                       <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="nomenclature" className="text-start d-block">Nomenclature : </label>
                          <Field
                            type="text"
                            name="nomenclature"
                            className="form-control mb-2"
                            placeholder="Enter Nomenclature"
                          />
                          <ErrorMessage name="nomenclature" component="div" className="text-danger text-start" />
                        </div>
                      </div> 
                   </div>


                    <div align="center">
                      <button type="submit" className={`btn ${mode === "add" ? "submit" : "edit"} mt-3`} >
                        {mode === "add" ? "SUBMIT" : "UPDATE"}
                      </button>
                      <button className="btn back mt-3" onClick={() => redirectComponentList()}>BACK</button>
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


export default ComponentAddEdit;