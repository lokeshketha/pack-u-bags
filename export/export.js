document.addEventListener('DOMContentLoaded', () => {
    
    // Set current date
    const dateElement = document.getElementById('current-date');
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = new Date().toLocaleDateString(undefined, options);

    // Share Button
    const btnShare = document.getElementById('btn-share');
    btnShare.addEventListener('click', function() {
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fa-solid fa-check"></i> Link Copied!';
        this.style.borderColor = '#22c55e';
        this.style.color = '#22c55e';
        
        setTimeout(() => {
            this.innerHTML = originalText;
            this.style.borderColor = '';
            this.style.color = '';
        }, 2000);
    });

    // Print Button
    const btnPrint = document.getElementById('btn-print');
    btnPrint.addEventListener('click', () => {
        window.print();
    });

    // Download PDF Button
    const btnDownload = document.getElementById('btn-download');
    btnDownload.addEventListener('click', function() {
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Generating PDF...';
        this.disabled = true;

        // Simulate network/generation time
        setTimeout(() => {
            this.innerHTML = '<i class="fa-solid fa-check"></i> PDF Downloaded!';
            this.style.background = '#22c55e';
            
            setTimeout(() => {
                this.innerHTML = originalText;
                this.disabled = false;
                this.style.background = '';
                alert('Your PDF "PackSmart_Report.pdf" has been downloaded successfully.');
            }, 2000);
        }, 1500);
    });
});
