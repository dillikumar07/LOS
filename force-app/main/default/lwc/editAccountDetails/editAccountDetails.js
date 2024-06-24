
import { LightningElement, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getRecordsForCurrentUser from '@salesforce/apex/HasLoanRecords.getRecordsForCurrentUser';

const COLUMNS = [
    { label: 'Loan Account Name', fieldName: 'Name', type: 'text' },
    { label: 'Date of Birth', fieldName: 'DateofBirth__c', type: 'date' },
    { label: 'Birthplace', fieldName: 'Birthplace__c', type: 'text' },
    { label: 'Marital Status', fieldName: 'Marital_status__c', type: 'picklist' },
   
    { label: 'Email Address', fieldName: 'EmailAddress__c', type: 'email' },
    { label: 'Permanent Residential Address', fieldName: 'PermanentResidentialAddress__c', type: 'textarea' },
    { label: 'Telephone Numbers', fieldName: 'TelephoneNumbers__c', type: 'number' },

    { label: 'Personal Identification', fieldName: 'PersonalIdentification__c', type: 'richtextarea' },
    { label: 'Signature', fieldName: 'Signature__c', type: 'richtextarea' },

    { label: 'Employment Status', fieldName: 'Bank_Name__c', type: 'text' },       
    { label: 'Position__c', fieldName: 'Bank_Branch__c', type: 'text' },
    { label: 'Salary', fieldName: 'Account_Number__c', type: 'number' },
    { label: 'Salary', fieldName: 'Account_Type__c', type: 'text' },
    { label: 'Work Address', fieldName: 'IFSC_Code__c', type: 'text' },

    { label: 'Employment Status', fieldName: 'Employment_Status__c', type: 'text' },       
    { label: 'Position__c', fieldName: 'Position__c', type: 'text' },
    { label: 'Salary', fieldName: 'Salary__c', type: 'number' },
    { label: 'Work Address', fieldName: 'Work_Address__c', type: 'text' }
];

export default class EditAccountDetails extends LightningElement {
    @track records;
    @track error;
    @track showModal = false;
    columns = COLUMNS;
    objectName = 'Loan_Account__c'; // Example object name

    handlelEditButton(){
            this.showModal = true;
    }

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

    handleSuccess(event) {
        const evt = new ShowToastEvent({
            title: "Success",
            message: "Record updated successfully",
            variant: "success",
        });
        this.dispatchEvent(evt);
    }
}
