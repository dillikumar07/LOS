import { LightningElement,wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import hasRecordsForCurrentUser from '@salesforce/apex/HasLoanRecords.hasRecordsForCurrentUser';


export default class ViewMyAccount extends NavigationMixin(LightningElement) {

    @track hasLoanAccount = false;
    objectName = 'Loan_Account__c'; // Example object name

    @wire(hasRecordsForCurrentUser, { objectName: '$objectName' })
    wiredHasRecords({ error, data }) {
        if (data) {
            console.log("Data", data);
            this.hasLoanAccount = true;
            console.log(this.hasLoanAccount); // Records exist
        } else if (error) {
            console.error('Error fetching records:', error);
        }
    }
    handleButtonClick() {
        if(this.hasLoanAccount==true){
            
            this.navigateToViewLoanAccount();
        }else{
            const evt = new ShowToastEvent({
                title: "Error. No Records Found",
                message: "First Create a Loan Account", 
                variant: "error"
            });
            this.dispatchEvent(evt);
    
        }
        
    }

    navigateToViewLoanAccount() {
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'Customer_Information' // Replace with the actual API name of your custom app page
            }
        });
    }
}
