import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AdmissionModule } from "./modules/admission/admission.module";
import { AuditModule } from "./modules/audit/audit.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CatalogModule } from "./modules/catalog/catalog.module";
import { CommissionsModule } from "./modules/commissions/commissions.module";
import { DocumentsModule } from "./modules/documents/documents.module";
import { FilesModule } from "./modules/files/files.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { ReportingModule } from "./modules/reporting/reporting.module";
import { StudentsModule } from "./modules/students/students.module";
import { UsersModule } from "./modules/users/users.module";
import { VisaModule } from "./modules/visa/visa.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    CatalogModule,
    StudentsModule,
    FilesModule,
    PaymentsModule,
    DocumentsModule,
    AdmissionModule,
    VisaModule,
    CommissionsModule,
    NotificationsModule,
    ReportingModule,
    AuditModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
