import { LightningElement,track, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import hasRecordsForCurrentUser from '@salesforce/apex/HasLoanRecords.hasRecordsForCurrentUser';

export default class CreateLoanAccountComponent extends LightningElement {
    
    @track showLoanAccountForm = true;
    @track objectName = 'Loan_Account__c';

    @wire(hasRecordsForCurrentUser, { objectName: '$objectName' })
    wiredHasRecords({ error, data }) {
        if (data) {
            this.showLoanAccountForm = false; // Records exist
        } else if (error) {
            console.error('Error fetching records:', error);
        }
    }
    handleSuccess(event) {

        const evt = new ShowToastEvent({
            title: "Loan Account Created",
            message: "Record ID: " + event.detail.id,
            variant: "success"
        });
        this.dispatchEvent(evt);
        this.showLoanAccountForm = false; 
        refreshApex(this.wiredHasRecordsResult);
        
    }
}
