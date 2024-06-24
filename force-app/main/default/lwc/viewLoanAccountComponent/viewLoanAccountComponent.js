

import { LightningElement, wire, track } from 'lwc';
import getRecordsForCurrentUser from '@salesforce/apex/HasLoanRecords.getRecordsForCurrentUser';

const COLUMNS = [
    { label: 'Loan Account Name', fieldName: 'Name', type: 'text' },
    { label: 'Date of Birth', fieldName: 'DateofBirth__c', type: 'date' },
    { label: 'Banking Information', fieldName: 'BankingInformation__c', type: 'text' },
    { label: 'Birthplace', fieldName: 'Birthplace__c', type: 'text' },
    { label: 'Marital Status', fieldName: 'Marital_status__c', type: 'picklist' },
    { label: 'Created By', fieldName: 'CreatedById', type: 'lookup' },
    { label: 'Current Employer', fieldName: 'CurrentEmployer__c', type: 'text' },    
    { label: 'Email Address', fieldName: 'EmailAddress__c', type: 'email' },
    { label: 'Last Modified By', fieldName: 'LastModifiedById', type: 'lookup' },
    { label: 'Legal Name', fieldName: 'Legal_name__c', type: 'text' },   
    { label: 'Owner', fieldName: 'OwnerId', type: 'lookup' },
    { label: 'Permanent Residential Address', fieldName: 'PermanentResidentialAddress__c', type: 'textarea' },
    { label: 'Personal Identification', fieldName: 'PersonalIdentification__c', type: 'richtextarea' },
    { label: 'Present Occupation', fieldName: 'PresentOccupation__c', type: 'text' },
    { label: 'Signature', fieldName: 'Signature__c', type: 'richtextarea' },
    { label: 'Source of Income', fieldName: 'SourceofIncome__c', type: 'text' },
    { label: 'Telephone Numbers', fieldName: 'TelephoneNumbers__c', type: 'number' }
];

export default class ViewLoanAccountComponent extends LightningElement {
    @track records;
    @track error;
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
}
