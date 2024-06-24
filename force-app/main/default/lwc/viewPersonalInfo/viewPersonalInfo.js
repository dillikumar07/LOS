import { LightningElement, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getRecordsForCurrentUser from '@salesforce/apex/HasLoanRecords.getRecordsForCurrentUser';

const COLUMNS = [
    { label: 'Loan Account Name', fieldName: 'Name', type: 'text' },
    { label: 'Date of Birth', fieldName: 'DateofBirth__c', type: 'date' },    
    { label: 'Birthplace', fieldName: 'Birthplace__c', type: 'text' },
    { label: 'Marital Status', fieldName: 'Marital_status__c', type: 'picklist' },     
    { label: 'Email Address', fieldName: 'EmailAddress__c', type: 'email' },   
];

export default class ViewPersonalInfo extends LightningElement {
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
