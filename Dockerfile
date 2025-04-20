FROM pytorch/pytorch:2.0.1-cuda11.7-cudnn8-runtime

# Set up environment
WORKDIR /app

# Install dependencies
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    tzdata \
    && rm -rf /var/lib/apt/lists/*


# Install MusicGen
RUN git clone https://github.com/facebookresearch/audiocraft.git /app/audiocraft
WORKDIR /app/audiocraft

# Install Python dependencies (including system tools needed for pesq)
RUN apt-get update && apt-get install -y \
    build-essential \
    libsndfile1 \
    libsndfile1-dev \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip \
    && pip install -e .[musicgen]


# Default command
CMD ["python", "scripts/interact.py"]
