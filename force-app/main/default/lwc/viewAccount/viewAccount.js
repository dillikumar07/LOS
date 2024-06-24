import { LightningElement, wire, track } from 'lwc';
import getRecordsForCurrentUser from '@salesforce/apex/HasLoanRecords.getRecordsForCurrentUser';
import updateLoanAccount from '@salesforce/apex/HasLoanRecords.updateLoanAccount';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ViewAccount extends LightningElement {
    @track records;
    @track error;
    @track isEditing = {
        Legal_name__c: false,
        DateofBirth__c: false,
        Birthplace__c: false,
        EmailAddress__c: false,
        TelephoneNumbers__c: false,
        PresentOccupation__c: false,
        CurrentEmployer__c: false,
        BankingInformation__c: false,
        PersonalIdentification__c: false,
        Signature__c: false
    };

    @wire(getRecordsForCurrentUser)
    wiredRecords({ error, data }) {
        if (data) {
            this.records = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.records = undefined;
        }
    }

    handleEdit(event) {
        const fieldName = event.target.name.replace('edit', '');
        this.isEditing[fieldName] = true;
    }

    handleSave(event) {
        const fieldName = event.target.name.replace('save', '');
        const fields = {};

        fields[fieldName] = this.template.querySelector(`[data-field="${fieldName}"]`).value;
        
        updateLoanAccount({ fields })
            .then(() => {
                this.isEditing[fieldName] = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Record updated',
                        variant: 'success'
                    })
                );
            })
            .catch(error => {
                this.error = error;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error updating record',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
    }
}
