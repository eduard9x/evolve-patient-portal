import { Component, TemplateRef, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Medication } from '../../class/Medication';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';
import { Observable } from 'rxjs/Observable';
import { MedicationComment } from '../../class/MedicationComment';
import { MedicationDescription } from '../../class/MedicationDescription';
import { Sanitizer } from '@angular/core';
import { SecurityContext } from '@angular/core';
import { User } from '../../class/User';
import { SwitchBoardService } from '../../services/switch-board.service';
import { Subscription } from 'rxjs/Rx';

@Component({
    selector: 'evolve-review-medication',
    templateUrl: './review-medication.component.html',
    styleUrls: ['./review-medication.component.css']
})
export class ReviewMedicationComponent implements OnInit{
    public selectedMedication: Medication;
    public selectedMedicationComments: MedicationComment[];
    public selectedMedicationHistory: Medication[]
    public modalRef: BsModalRef;
    public medicationsList: Medication[];
    public newComment: string;
    public description: MedicationDescription;
    public sanitizer: Sanitizer;
    public collapsedDescription: boolean;
    private user: User = new User();
    private userSubscription: Subscription;

    public openModal(meds: Medication, template: TemplateRef<any>) {
        this.collapsedDescription = true;
        this.selectedMedication = meds;
        this.modalRef = this.modalService.show(template);
        let description = this.dataService.getWikiSummary(meds.medicationName);

        this.dataService.getMedicationComments(this.selectedMedication.medicationUserID).subscribe(
            res => this.selectedMedicationComments = res
        );

        if(this.user)
            if(this.user.userID)
                this.dataService.getMedicationHistory(this.selectedMedication.medicationID, this.user.userID).subscribe(
                    res => this.selectedMedicationHistory = res
                );

        this.dataService.getWikiSummary(meds.medicationName).subscribe(
            res => { this.description = res; }
        );
    }

    public removeComment(medicationUserCommentID) {
        this.dataService.removeMedicationComment(medicationUserCommentID);
        this.refreshMedicationComments();
    }

    public addComment() {
        if (this.newComment != null) {
            this.dataService.addMedicationComment(this.selectedMedication.medicationUserID, this.newComment);
            this.refreshMedicationComments();
            this.newComment = null;
        }
    }

    public refreshMedicationComments() {
        this.dataService.getMedicationComments(this.selectedMedication.medicationUserID).subscribe(
            res => this.selectedMedicationComments = res
        );
    }

    public toggleCollapse() {
        this.collapsedDescription = this.collapsedDescription == true ? false : true;
    }

    constructor(private dataService: DataService, private modalService: BsModalService, private switchboard: SwitchBoardService) {
        this.switchboard.user$.subscribe(usr => this.user = usr);
        this.dataService.getUserFromCookie(this.user);
    }

    ngOnInit(): void {
        if(this.user)
            if(this.user.userID)
                this.dataService.getMedicationList(this.user.userID).subscribe(
                    res => this.medicationsList = res
                )
    }
}