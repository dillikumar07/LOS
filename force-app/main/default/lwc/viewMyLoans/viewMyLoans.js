import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import hasRecordsForCurrentUser from '@salesforce/apex/HasLoanRecords.hasRecordsForCurrentUser';

export default class ViewMyLoans extends NavigationMixin(LightningElement) {

    @track hasLoanAccount = false;
    @track hasLoanApplication = false;

    @wire(hasRecordsForCurrentUser, { objectName: 'Loan_Account__c' })
    wiredLoanAccount({ error, data }) {
        if (data) {
            console.log("Loan Account Data", data);
            this.hasLoanAccount = true;
            console.log(this.hasLoanAccount); // Records exist
        } else if (error) {
            console.error('Error fetching loan account records:', error);
        }
    }

    @wire(hasRecordsForCurrentUser, { objectName: 'Loan_Application__c' })
    wiredLoanApplication({ error, data }) {
        if (data) {
            console.log("Loan Application Data", data);
            this.hasLoanApplication = true;
            console.log(this.hasLoanApplication); // Records exist
        } else if (error) {
            console.error('Error fetching loan application records:', error);
        }
    }

    handleMyLoans() {
        // Navigate to Loan Details Component
        if (this.hasLoanAccount && this.hasLoanApplication) {
            this[NavigationMixin.Navigate]({
                type: 'standard__objectPage',
                attributes: {
                    objectApiName: 'Loan_Application__c',
                    actionName: 'list'
                }
            });
        } else if (!this.hasLoanAccount) {
            const evt = new ShowToastEvent({
                title: "Error",
                message: "First create a Loan Account before applying for a loan",
                variant: "error"
            });
            this.dispatchEvent(evt);
        } else if (!this.hasLoanApplication) {
            const evt = new ShowToastEvent({
                title: "Error",
                message: "No loans applied. Apply for a new loan",
                variant: "error"
            });
            this.dispatchEvent(evt);
        }
    }
}
