import { LightningElement, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getRecordsForCurrentUser from '@salesforce/apex/HasLoanRecords.getRecordsForCurrentUser';

const COLUMNS = [
    
    { label: 'Employment Status', fieldName: 'Employment_Status__c', type: 'text' },       
    { label: 'Position__c', fieldName: 'Position__c', type: 'text' },
    { label: 'Salary', fieldName: 'Salary__c', type: 'number' },
    { label: 'Work Address', fieldName: 'Work_Address__c', type: 'text' }
    
];

export default class ViewEmployeeInfo extends LightningElement {
    @track records;
    @track error;
    @track showModal = false;
    columns = COLUMNS;
    objectName = 'Loan_Account__c'; // Example object name

    @wire(getRecordsForCurrentUser, { objectName: '$objectName' })
    wiredRecords({ error, data }) {
        if (data) {
            this.records = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.records = undefined;
        }
    }

    handlelEditButton(){
        this.showModal = true;
    }

    handleCloseModal(){
        this.showModal = false;
    }

    handleSuccess(event) {
        const evt = new ShowToastEvent({
            title: "Success",
            message: "Record updated successfully",
            variant: "success",
        });
        this.dispatchEvent(evt);
    }
}
