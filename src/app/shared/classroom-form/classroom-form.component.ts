import {Component, Input, OnInit} from '@angular/core';
import {Classroom} from 'src/app/models/classroom.model';
import {LoadingService} from 'src/app/services/loading.service';
import {NotificationsService} from 'angular2-notifications';
import {ClassroomService} from 'src/app/services/classroom.service';
import {NgForm} from '@angular/forms';
import {Router} from '@angular/router';
import {LoginService} from 'src/app/services/login.service';
import {ListService} from "../../services/list.service";
import {Subject} from "../../models/subject.model";

@Component({
  selector: 'list-aplic-classroom-form',
  templateUrl: './classroom-form.component.html',
  styleUrls: ['./classroom-form.component.scss']
})
export class ClassroomFormComponent implements OnInit {

  @Input() id: string;

  classroom: Classroom = {};
  subjects: Subject[] = [];
  response: any;
  accessUser: boolean;
  user: any;

  constructor(private readonly _classroomService: ClassroomService,
              private readonly _notificationsService: NotificationsService,
              private readonly _loadingService: LoadingService,
              private readonly _router: Router,
              private readonly _loginService: LoginService,
              private readonly _listService: ListService,
  ) {
    this.accessUser = this._loginService.checkAccessUser();
    this.user = this._loginService.readLoggedUser();
  }

  ngOnInit(): void {
    if (this.id !== null) {
      this.loadDataClassroom(this.id);
    }
    this._loadSubjects();
  }

  loadDataClassroom(id) {
    this._loadingService.processing = true;

    this._classroomService.findById(id)
      .then(data => {
        this.response = data;

        //Error
        if (this.response.error !== undefined && this.response.error.fieldErrors.length > 0) {
          this.response.error.fieldErrors.forEach(error => {
            this._notificationsService.error('Ocorreu um erro', error.message, {timeOut: 3000});
          });
        }
        //Success
        else {
          this.classroom = data;
        }

        this._loadingService.processing = false;
      });
  }

  submitForm(form: NgForm) {
    try {
      this._loadingService.processing = true;

      if (this.id === null) {
        this._addClassroom();
      } else {
        this._editClassroom();
      }
    } finally {
      this._loadingService.processing = false;
    }
  }

  private async _loadSubjects() {
    this.subjects = await this._listService.getAllSubjects();
  }

  private async _addClassroom() {
    //pega instructorId de acordo com o usuário logado
    this.classroom.instructorId = this.user.id;

    await this._classroomService.save(this.classroom)
      .then(data => {
        this.response = data;

        //Error
        if (this.response.error !== undefined && this.response.error.fieldErrors.length > 0) {
          this.response.error.fieldErrors.forEach(error => {
            this._notificationsService.error('Ocorreu um erro', error.message, {timeOut: 3000});
          });
        }
        //Success
        else {
          this._notificationsService.success('Turma Criada', this.classroom.name, {timeOut: 3000});
          this._router.navigate(['list-classroom']);
        }
      });
  }

  private async _editClassroom() {
    await this._classroomService.update(this.classroom)
      .then(data => {
        this.response = data;

        //Error
        if (this.response.error !== undefined && this.response.error.fieldErrors.length > 0) {
          this.response.error.fieldErrors.forEach(error => {
            this._notificationsService.error('Ocorreu um erro', error.message, {timeOut: 3000});
          });
        }
        //Success
        else {
          this._notificationsService.success('Turma Editada', this.classroom.name, {timeOut: 3000});
          this._router.navigate(['list-classroom']);
        }
      });
  }
}
