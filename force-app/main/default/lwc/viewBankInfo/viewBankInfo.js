

import { LightningElement, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getRecordsForCurrentUser from '@salesforce/apex/HasLoanRecords.getRecordsForCurrentUser';

const COLUMNS = [
    
    { label: 'Bank Name', fieldName: 'Bank_Name__c', type: 'text' },       
    { label: 'Bank Branch', fieldName: 'Bank_Branch__c', type: 'text' },
    { label: 'Account Number', fieldName: 'Account_Number__c', type: 'number' },
    { label: 'Account Type', fieldName: 'Account_Type__c', type: 'text' },
    { label: 'IFSC Code', fieldName: 'IFSC_Code__c', type: 'text' },
    
];

export default class ViewBankInfo extends LightningElement {
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
