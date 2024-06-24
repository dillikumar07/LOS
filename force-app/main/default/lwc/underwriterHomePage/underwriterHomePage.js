

import { LightningElement, wire, track } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getVerifiedPersonalLoans from '@salesforce/apex/UnderWriterHomePage.getVerifiedPersonalLoans';
import getVerifiedVehicleLoans from '@salesforce/apex/UnderWriterHomePage.getVerifiedVehicleLoans';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import updateLoanApplicationCreditScore from '@salesforce/apex/LoanService.updateLoanApplicationCreditScore';
import updateSanctionedLoanAmount  from '@salesforce/apex/LoanService.updateSanctionedLoanAmount';
import sendEmail from '@salesforce/apex/LoanOfficerController.sendEmail';


export default class UnderwriterHomePage extends NavigationMixin(LightningElement) {
    @track personalLoans;
    @track vehicleLoans;
    @track wiredPersonalLoansResult;
    @track wiredVehicleLoansResult;
    @track showRejectionModal = false;
    @track selectedLoanId;
    @track rejectionReason = '';
    approvalOptions = [
        { label: 'Approved', value: 'Approved' },
        { label: 'Rejected', value: 'Rejected' }
    ];

    @wire(getVerifiedPersonalLoans)
    wiredPersonalLoans(result) {
        this.wiredPersonalLoansResult = result;
        if (result.data) {
            this.personalLoans = result.data.map(record => ({ ...record }));
        } else if (result.error) {
            console.error(result.error);
        }
    }

    @wire(getVerifiedVehicleLoans)
    wiredVehicleLoans(result) {
        this.wiredVehicleLoansResult = result;
        if (result.data) {
            this.vehicleLoans = result.data.map(record => ({ ...record }));
        } else if (result.error) {
            console.error(result.error);
        }
    }

    handleApprovalStatusChange(event) {
        const recordId = event.target.name;
        const newStatus = event.target.value;
    
        if (newStatus === 'Rejected') {
            // If the status is 'Rejected', proceed with updating the record first
            const recordInput = {
                fields: {
                    Id: recordId,
                    ApprovalStatusByUnderwriter__c: newStatus
                }
            };
    
            updateRecord(recordInput)
                .then(() => {
                    
                   
                    this.selectedLoanId = recordId; 
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Approval status updated',
                            variant: 'success'
                        })
                    );
                    // Refresh the data
                    
                    this.refreshData();
                    this.showRejectionModal = true;
                })
                .catch(error => {
                    console.error(error);
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error updating record',
                            message: error.body.message,
                            variant: 'error'
                        })
                    );
                });
        } else {
            // If the status is not 'Rejected', proceed with updating the record directly
            const recordInput = {
                fields: {
                    Id: recordId,
                    Approval_Status_By_Underwriter__c: newStatus
                }
            };
    
            updateRecord(recordInput)
                .then(() => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Approval status updated',
                            variant: 'success'
                        })
                    );
                    // Refresh the data
                    this.refreshData();
                })
                .catch(error => {
                    console.error(error);
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
    
    
    handleViewDocuments(event) {
        const recordId = event.target.dataset.id; // Fetch Document Id from the button's dataset
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                actionName: 'view',
            },
            state: {
                navigationLocation: 'RELATED_LIST',
                objectApiName: 'Loan_Documents__c', // Change this to the API name of the parent object where your Notes and Attachments related list is located
                relatedListApiName: 'CombinedAttachments', // Use the API name of the Notes and Attachments related list
            },
        });
    }
    handleViewRecord(event){
        const recordId1 = event.target.dataset.id;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId1,
                actionName: 'view',
            },
            state: {
                navigationLocation: 'RELATED_LIST',
                objectApiName: 'loan__c', // Change this to the API name of the parent object where your Notes and Attachments related list is located
                relatedListApiName: 'CombinedAttachments', // Use the API name of the Notes and Attachments related list
            },
        });
    }

    refreshData() {
        // Refresh the data here (call wire methods again)
        refreshApex(this.wiredPersonalLoansResult);
        refreshApex(this.wiredVehicleLoansResult);
    }
    handleCheckEligibility(event) {
        const salary = parseInt(event.target.dataset.salary, 10); // Parse salary as integer
        const loanId = event.target.dataset.id;
        let creditScore = event.target.dataset.creditscore;
        if (!creditScore) {
            creditScore = Math.floor(Math.random() * (900 - 400 + 1)) + 400;
            console.log("Credit Score : ",creditScore);
            console.log("Loan Id : ",loanId);
            updateLoanApplicationCreditScore({ loanId, creditScore });
                
        }
      if (salary >= 25000 && creditScore > 600) {
          
          this.dispatchEvent(
            new ShowToastEvent({
              title: 'Eligible',
              message: `Congratulations! You are eligible for the loan with a credit score of ${creditScore} and salary of ${salary}.`,
              variant: 'success'
            })
          );
        } else {
         
          this.dispatchEvent(
            new ShowToastEvent({
              title: 'Not Eligible',
              message: 'Sorry, you are not eligible for the loan.',
              variant: 'error'
            })
          );
        }
      
        // Refresh the data
        this.refreshData();
      }

      

    handleSanctionLoan(event) {
        const salary = parseInt(event.target.dataset.salary, 10);
        console.log('salary is',salary);
        const loanId = event.target.dataset.id;
        console.log('Loan Id',loanId);
        const loanAmount = parseInt(event.target.dataset.loanAmount, 10);
        console.log('Amount is', loanAmount);
        let sanctionedAmount = 0;

        if (loanAmount <= 0) {
            // Show error message if loan amount is invalid
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Invalid loan amount.',
                    variant: 'error'
                })
            );
            return;
        }

        // Calculate sanctioned amount
        if (loanAmount <= (salary * 0.6)) {
            sanctionedAmount = loanAmount;
        } else {
            sanctionedAmount = salary * 0.6;
        }

        // Call the Apex method to update sanctioned loan amount
        updateSanctionedLoanAmount({ loanId: loanId, sanctionedAmount: sanctionedAmount })
            .then(result => {
                console.log('successfully called tshe function');
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Loan sanctioned successfully.',
                        variant: 'success'
                    })
                );
            
                this.refreshData();
            })
            .catch(error => {
                console.error('Error updating sanctioned loan amount:', error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'An error occurred while updating sanctioned loan amount.',
                        variant: 'error'
                    })
                );
            });
    }
    handleCloseModal() {
        this.showRejectionModal = false;
        this.rejectionReason = '';
    }

    // Handle rejection reason change
    handleRejectionReasonChange(event) {
        this.rejectionReason = event.target.value;
    }

    
    handleSendEmail() {
        // Call the Apex method to send the email
        sendEmail({ loanId: this.selectedLoanId, rejectionReason: this.rejectionReason })
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Email sent successfully',
                        variant: 'success'
                    })
                );
            })
            .catch(error => {
                console.error(error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error sending email',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
        
        // Close the modal after sending email
        this.showRejectionModal = false;
        this.rejectionReason = '';
    }

      
}