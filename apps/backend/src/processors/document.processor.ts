import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { UploadsService } from '../modules/uploads/uploads.service';

@Processor('document-processing')
export class DocumentProcessingProcessor {
    constructor(private uploadsService: UploadsService) {}

    @Process('process-document')
    async handleDocumentProcessing(job: Job<{ documentId: string }>) {
        const { documentId } = job.data;

        console.log(`🔄 Processing document ${documentId}...`);

        try {
            await this.uploadsService.vectorizeDocument(documentId);
            console.log(`✅ Document ${documentId} processed successfully`);
        } catch (error) {
            console.error(`❌ Failed to process document ${documentId}:`, error);
            throw error;
        }
    }
}
