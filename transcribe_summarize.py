#!/usr/bin/env python3
"""
Video transcription and summarization pipeline.

Usage:
    python transcribe_summarize.py <video_file> [--output <output_file>]

Requires:
    - OPENAI_API_KEY environment variable (for Whisper transcription)
    - ANTHROPIC_API_KEY environment variable (for Claude summarization)
    - ffmpeg installed on the system
"""

import argparse
import os
import subprocess
import sys
import tempfile
from pathlib import Path

import anthropic
import openai


def extract_audio(video_path: Path, output_path: Path) -> None:
    """Extract audio from video file using ffmpeg."""
    result = subprocess.run(
        [
            "ffmpeg", "-y",
            "-i", str(video_path),
            "-vn",                  # no video
            "-acodec", "libmp3lame",
            "-ar", "16000",         # 16kHz — optimal for Whisper
            "-ac", "1",             # mono
            "-q:a", "4",
            str(output_path),
        ],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg failed:\n{result.stderr}")


def transcribe_audio(audio_path: Path, openai_client: openai.OpenAI) -> str:
    """Transcribe audio file using OpenAI Whisper API."""
    with open(audio_path, "rb") as audio_file:
        response = openai_client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            response_format="text",
        )
    return response


def summarize_transcription(transcription: str, anthropic_client: anthropic.Anthropic) -> str:
    """Summarize transcription text using Claude API with streaming."""
    summary_parts = []

    with anthropic_client.messages.stream(
        model="claude-opus-4-8",
        max_tokens=2048,
        thinking={"type": "adaptive"},
        messages=[
            {
                "role": "user",
                "content": (
                    "Hier ist eine Transkription eines Videos. "
                    "Erstelle bitte eine strukturierte Zusammenfassung auf Deutsch mit:\n"
                    "- Hauptthema / Kernaussage\n"
                    "- Wichtigste Punkte (als Stichpunkte)\n"
                    "- Schlussfolgerung oder Fazit\n\n"
                    f"Transkription:\n\n{transcription}"
                ),
            }
        ],
    ) as stream:
        for text in stream.text_stream:
            summary_parts.append(text)
            print(text, end="", flush=True)

    print()  # newline after streaming
    return "".join(summary_parts)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Transcribe a video and generate a summary using OpenAI Whisper + Claude."
    )
    parser.add_argument("video", help="Path to the video file")
    parser.add_argument("--output", "-o", help="Save results to this file (optional)")
    parser.add_argument(
        "--language",
        "-l",
        default=None,
        help="Language hint for Whisper (e.g. 'de', 'en'). Auto-detected if omitted.",
    )
    args = parser.parse_args()

    video_path = Path(args.video).resolve()
    if not video_path.exists():
        print(f"Error: Video file not found: {video_path}", file=sys.stderr)
        sys.exit(1)

    openai_api_key = os.environ.get("OPENAI_API_KEY")
    anthropic_api_key = os.environ.get("ANTHROPIC_API_KEY")

    if not openai_api_key:
        print("Error: OPENAI_API_KEY environment variable is not set.", file=sys.stderr)
        sys.exit(1)
    if not anthropic_api_key:
        print("Error: ANTHROPIC_API_KEY environment variable is not set.", file=sys.stderr)
        sys.exit(1)

    openai_client = openai.OpenAI(api_key=openai_api_key)
    anthropic_client = anthropic.Anthropic(api_key=anthropic_api_key)

    with tempfile.TemporaryDirectory() as tmpdir:
        audio_path = Path(tmpdir) / "audio.mp3"

        print(f"[1/3] Extrahiere Audio aus: {video_path.name}")
        extract_audio(video_path, audio_path)
        print(f"      Audio gespeichert: {audio_path} ({audio_path.stat().st_size // 1024} KB)")

        print("\n[2/3] Transkribiere mit OpenAI Whisper...")
        transcription = transcribe_audio(audio_path, openai_client)
        print(f"      Transkription abgeschlossen ({len(transcription)} Zeichen)")

        print("\n[3/3] Erstelle Zusammenfassung mit Claude...\n")
        print("=" * 60)
        summary = summarize_transcription(transcription, anthropic_client)
        print("=" * 60)

    if args.output:
        output_path = Path(args.output)
        output_path.write_text(
            f"# Transkription\n\n{transcription}\n\n# Zusammenfassung\n\n{summary}\n",
            encoding="utf-8",
        )
        print(f"\nErgebnisse gespeichert in: {output_path}")
    else:
        print("\n--- Vollständige Transkription ---")
        print(transcription)


if __name__ == "__main__":
    main()
