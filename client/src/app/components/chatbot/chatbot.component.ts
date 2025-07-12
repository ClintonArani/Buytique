import { AfterViewChecked, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements AfterViewChecked {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();
  
  userMessage = '';
  chatMessages: { text: string; isUser: boolean; time?: Date }[] = [];
  isLoading = false;
  autoScroll = true;

  constructor(private chatService: ChatService) {}

  ngAfterViewChecked() {
    if (this.autoScroll) {
      this.scrollToBottom();
    }
  }

  closeChat() {
    this.closed.emit();
  }

  onScroll() {
    const element = this.messageContainer.nativeElement;
    const atBottom = element.scrollHeight - element.scrollTop === element.clientHeight;
    this.autoScroll = atBottom;
  }
  sendMessage() {
    if (!this.userMessage.trim() || this.isLoading) return;

    // Add user message to chat
    this.addMessage(this.userMessage, true);
    const messageContent = this.userMessage;
    this.userMessage = '';
    this.isLoading = true;

    // Call chat service
    this.chatService.sendMessage(messageContent).subscribe({
      next: (response: any) => {
        this.addMessage(response.response, false);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Chat API error:', error);
        this.addMessage("Sorry, I'm having trouble connecting. Please try again later.", false);
        this.isLoading = false;
      }
    });
  }

  private addMessage(text: string, isUser: boolean) {
    this.chatMessages.push({ 
      text, 
      isUser, 
      time: new Date() 
    });
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      setTimeout(() => {
        this.messageContainer.nativeElement.scrollTop = 
          this.messageContainer.nativeElement.scrollHeight;
      }, 100);
    } catch(err) {
      console.error('Scroll error:', err);
    }
  }
}