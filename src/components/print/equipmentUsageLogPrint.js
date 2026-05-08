import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { format } from "date-fns";


pdfMake.vfs = pdfFonts.vfs;

export const printEquipmentUsageLog = (equipmentLogList, equipmentName, fromDateValue, toDateValue) => {
    // Build table body
    const tableBody = [];

    const fromDate = format(new Date(fromDateValue), "dd-MM-yyyy");
    const toDate = format(new Date(toDateValue), "dd-MM-yyyy");

    // Table Header
    tableBody.push([
        { text: "SN", style: "tableHeader" },
        { text: "Start Time", style: "tableHeader" },
        { text: "End Time", style: "tableHeader" },
        { text: "Total Hrs", style: "tableHeader" },
        { text: "Description", style: "tableHeader" },
        { text: "Used By", style: "tableHeader" }
    ]);

    // Table Rows
    equipmentLogList.forEach((item, index) => {
        tableBody.push([
            index + 1,
            item.startTime ? item.startTime : '-',
            item.endTime ? item.endTime : '-',
             { text: item.totalHours || "", alignment: "right" },  // <-- right aligned
            item.description || "",
            item.usedByName || ""
        ]);
    });

    // PDF Document Definition
    const docDefinition = {
        pageSize: "A3",
        
        pageMargins: [20, 20, 20, 20],

        content: [
            { text: "Equipment Usage Log Report", style: "title", margin: [0, 0, 0, 10] },

            {

                style: "subTitle",
                alignment: "center",
                margin: [0, 0, 0, 10],
                text: [
                    "Equipment : ",
                    { text: equipmentName, color: "blue", bold: true },
                    "     From : ",
                    { text: fromDate, color: "blue", bold: true },
                    "     To : ",
                    { text: toDate, color: "blue", bold: true }
                ]
            },

            {
                style: "tableStyle",
                table: {
                    headerRows: 1,
                    //widths: ["auto", "auto", "auto", "auto", "auto", "auto"],  // Increased width
                    widths: ["auto", "auto", "auto", "auto", "*", "*"], 

                    body: tableBody,
                },
                layout: {
                    fillColor: function (rowIndex) {
                        return rowIndex === 0 ? "#AED6F1" : null;
                    },
                    hLineColor: "#aaa",
                    vLineColor: "#aaa",
                }
            }
        ],

        styles: {
            title: {
                fontSize: 16,
                bold: true,
                alignment: "center",
            },
            tableHeader: {
                bold: true,
                fontSize: 12,
                alignment: "center"
            },
            tableStyle: {
                margin: [0, 5, 0, 15]
            }
        }
    };

    pdfMake.createPdf(docDefinition).open();
};
