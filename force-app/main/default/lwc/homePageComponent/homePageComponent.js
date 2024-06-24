import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class HomePageComponent extends NavigationMixin(LightningElement) {
    navigateToCreateLoanAccount() {

        console.log('Start');
        this[NavigationMixin.Navigate]({
            type: 'standard__component',
            attributes: {
                componentName: 'c__navigateToCreate'
            }
        });
        console.log('End');
    }

    navigateToViewLoanAccount() {
        this[NavigationMixin.Navigate]({
            type: 'standard__component',
            attributes: {
                componentName: 'c__viewLoanAccountComponent'
            }
        });
    }
}
