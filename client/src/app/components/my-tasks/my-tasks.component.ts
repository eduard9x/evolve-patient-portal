import {Component, OnInit} from '@angular/core';
import {DataService} from '../../services/data.service';
import {Task} from '../../class/Task';
import {User} from '../../class/User';
import {SwitchBoardService} from '../../services/switch-board.service';
import {Router} from '@angular/router';

@Component({
    selector: 'evolve-my-tasks',
    templateUrl: './my-tasks.component.html',
    styleUrls: ['./my-tasks.component.css']
})

export class MyTasksComponent implements OnInit {
    public tasksList: Task[];
    private user: User = new User();
    private emptyList;

    constructor(private dataService: DataService, private router: Router, private switchboard: SwitchBoardService) {
        this.switchboard.user$.subscribe(usr => this.user = usr);
        this.dataService.getUserFromCookie(this.user);
        this.emptyList = true;
    }

    btnClick = function (currentTask: Task) {
        this.router.navigateByUrl('/questionnaire?taskID=' + btoa(currentTask.taskID.toString()));
    };

    ngOnInit(): void {
        if (this.user)
            if (this.user.userID)
                this.dataService.getTaskList(this.user.userID).subscribe(
                    res => {
                        if (res.length == 0) {
                            this.emptyList = true;
                        } else {
                            this.tasksList = res;
                            this.emptyList = false;
                        }
                    }
                );
    }
}
